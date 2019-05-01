import React from 'react';
import {
  Platform,
  Dimensions,
  View,
  Alert,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import PropTypes from 'prop-types';
import Animation from 'lottie-react-native';
import axios from 'axios';
import InfiniteFlatList from '@foundcareers/react-native-infinite-flatlist';

import LottieFilesCrawler from 'crawl-lottie-files';

class ViewportAwareLottie extends React.Component {
  constructor(nextProps) {
    super(nextProps);
    this.state = {
      visible: false,
      source: null,
    };
    this.wrapper = null;
    this.interval = null;
  }
  componentDidMount() {
    const {
      url,
    } = this.props;
    const {
      visible,
    } = this.state;
    this.interval = this.__getViewportInterval();
    if (visible && url) {
      this.__cacheUrl(url)
        .catch((e) => {
          // TODO: handle this error
          Alert.alert('err');
        });
    }
  }
  componentWillUnmount() {
    this.clearInterval(
      this.interval,
    );
  }
  __isWithin(viewport, top, bottom, left, right, lookAhead) {
    // TODO: Depends on REAL_WINDOW_HEIGHT for Android. (Use react-native-extra-dimensions.)
    return (top >= (-1 * lookAhead)) && (bottom <= (viewport.height + lookAhead));
  }        
  __getViewportInterval() {
    const {
      lookAhead,
    } = this.props;
    return this.setInterval(
      () => {
        if (!!this.wrapper) {
          this.wrapper.measure((x, y, width, height, pageX, pageY) => {
            const visible = this.__isWithin(
              Dimensions.get('window'),
              pageY,
              pageY + height,
              pageX,
              pageX + width,
              lookAhead,
            );
            if ((visible && !this.state.visible) || (!visible && this.state.visible)) {
              this.setState(
                {
                  visible,
                },
              );
            }
          });
        }
      },
      100,
    );
  }
  componentWillUpdate(nextProps, nextState) {
    const {
      url,
    } = nextProps;
    const {
      visible,
      source,
    } = nextState;
    const urlDidChange = url && (url !== this.props.url);
    const visibilityDidChange = (visible !== this.state.visible);
    if ((urlDidChange && visible) || (visibilityDidChange && visible && url)) {
      this.__cacheUrl(url)
        .catch((e) => {
          Alert.alert('err');
          // TODO: handle this error
        });
    }
    if (visibilityDidChange && !visible && source) {
      this.setState(
        {
          source: null,
        },
      );
    }
  }
  __cacheUrl(url) {
    return axios(
      {
        method: 'get',
        url,
      },
    )
      .then(({ data: source }) => new Promise((resolve) => {
        return this.setState(
          {
            source,
          },
          () => resolve(source),
        );
      }))
  }
  render() {
    const {
      width,
      height,
    } = this.props;
    const {
      source,
      visible,
    } = this.state;
     const hackProps = (Platform.OS === 'android') ? ({
       removeClippedSubviews: false,
       collapsable: false,
       renderToHardwareTextureAndroid: true,
     }) : ({});
    return (
      <View
        ref={el => this.wrapper = el}
        {...hackProps}
        style={{
          width,
          height,
          borderWidth: 1,
          opacity: 1,
        }}
        onLayout={(e) => {
          
        }}
      >
        {(!!source) && (
          <Animation
            style={{
              width,
              height,
              backgroundColor: 'red',
            }}
            source={source}
            loop
            autoPlay
          />
        )}
        {(!source) && (
          <View
            style={{
              width,
              height,
              backgroundColor: 'yellow',
            }}
          />
        )}
      </View>
    );
  }
}

Object.assign(
  ViewportAwareLottie.prototype,
  require('react-timer-mixin'),
);

ViewportAwareLottie.propTypes = {
  style: PropTypes.shape({}),
  url: PropTypes.string.isRequired,
  lookAhead: PropTypes.number,
};

ViewportAwareLottie.defaultProps = {
  lookAhead: Dimensions.get('window').height * 0.5,
};

class LottieFilesPicker extends React.Component {
  constructor(nextProps) {
    super(nextProps);
    this.state = {
      lottieFilesCrawler: null,
      items: [],
      page: 1,
      forceRefresh: false,
      refreshing: false,
      width: null,
      height: null,
    };
    this.__renderItem = this.__renderItem.bind(this);
    this.__onLayout = this.__onLayout.bind(this);
    this.__fetchAnimations = this.__fetchAnimations.bind(this);
  }
  componentDidMount() {
    this.__initializeLottieFilesCrawler()
      .then(() => {
        const {
          lottieFilesCrawler,
        } = this.state;
      });
  }
  componentWillUpdate(nextProps, nextState) {
    const {
      mode,
    } = nextProps;
    if (nextProps.mode !== this.props.mode) {
      this.__handleModeChange(
        nextProps,
        nextState,
      );
    }
  }
  __onLayout({ nativeEvent: { layout: { width, height } } }) {
    this.setState(
      {
        width,
        height,
      },
    );
  }
  __fetchAnimations(mode, page) {
    const {
      lottieFilesCrawler,
      refreshing,
    } = this.state;
    if (lottieFilesCrawler) {
      if (refreshing) {
        return Promise.reject(
          new Error(
            'Unable to fetching whilst currently refreshing!',
          ),
        );
      }
      return new Promise((resolve, reject) => {
        this.setState(
          {
            refreshing: true,
          },
          () => {
            return lottieFilesCrawler
              .crawl(
                mode,
                {
                  page,
                },
              )
              .then(results => results.map(() => results[1]))
              .then(results => [results[0], results[0], results[0], results[0]])
              .then((results) => {
                this.setState(
                  {
                    refreshing: false,
                    items: [
                      ...this.state.items,
                      ...results,
                    ],
                  },
                  () => resolve(results),
                );
              })
              .catch((e) => {
                this.setState(
                  {
                    refreshing: false,
                  },
                  () => reject(e),
                );
              });
          },
        );
      });
    }
    return Promise.reject(
      new Error(
        `Failed to crawl "${mode}" page #${page}. The LottieFilesCrawler has not yet been initialized!`,
      ),
    );
  }
  __initializeLottieFilesCrawler() {
    return new LottieFilesCrawler()
      .authenticate()
      .then(lottieFilesCrawler => new Promise((resolve) => {
        this.setState(
          { lottieFilesCrawler },
          resolve,
        );
      }));
  }
  __handleModeChange(nextProps, nextState) {
    this.setState(
      {
        page: 1,
        items: [],
      },
    );
  } 
  __renderItem({ item }) {
    const {
      width,
      height,
      items,
      forceRefresh,
    } = this.state;
    const {
      path: url,
    } = item;
    return (
      <ViewportAwareLottie
        width={width}
        height={width}
        url={url}
      />
    );
  }
  render() {
    const {
      style,
      onError,
    } = this.props;
    const {
      items,
      refreshing,
      page,
      forceRefresh,
    } = this.state;
    return (
      <InfiniteFlatList
        extraData={forceRefresh}
        style={style || styles.container}
        onLayout={this.__onLayout}
        data={items}
        renderItem={this.__renderItem}
        loading={refreshing}
        refreshing={refreshing}
        onRefresh={this.__fetchAnimations}
        onEndReached={this.__fetchAnimations}
        emptyText="No Items"
      />
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

LottieFilesPicker.propTypes = {
  mode: PropTypes.string,
  onError: PropTypes.func.isRequired,
};

LottieFilesPicker.defaultProps = {
  mode: 'recent',
};

export default LottieFilesPicker;
