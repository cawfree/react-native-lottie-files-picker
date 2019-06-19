import React from 'react';
import {
  // TODO: remove this
  Animated,
  Image,
  Platform,
  Dimensions,
  View,
  Alert,
  StyleSheet,
  TouchableOpacity,
  Text,
  Linking,
} from 'react-native';
import PropTypes from 'prop-types';
import Animation from 'lottie-react-native';
import axios from 'axios';
import Icon from 'react-native-vector-icons/FontAwesome';
import InfiniteFlatList from '@foundcareers/react-native-infinite-flatlist';

import LottieFilesCrawler from 'crawl-lottie-files';

const goToUrl = (url) => {
  return Promise.resolve()
    .then(() => {
      return Linking.canOpenURL(url)
        .then((isSupported) => {
          if (isSupported) {
            return Linking.openURL(
              url,
            );
          }
          return Promise.reject(
            new Error(
              `Failed to open url "${url}"`,
            ),
          );
        })
    });
};

export const goToLottieFiles = () => goToUrl('https://lottiefiles.com');
const goToArtist = slug => goToUrl(`https://lottiefiles.com${slug}`);

const MARGIN_STANDARD = 15;
const MARGIN_SHORT = 10;
const MARGIN_EXTRA_SHORT = 5;

const DIM_INFO_BAR = 60;
const DIM_THUMBNAIL = 50;
const DIM_TOP_BAR = 80;
const DIM_LOGO_HEIGHT = DIM_TOP_BAR * 0.6;

export const COLOR_LOTTIE_FILES = '#2BEAED';
export const COLOR_LOTTIE_FILES_LITE= '#0FCCCE';

const getLottieFilesLogo = () => 'data:image/jpeg;base64,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';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});


export class ViewportAware extends React.Component {
  constructor(nextProps) {
    super(nextProps);
    this.state = {
      visible: false,
    };
    this.viewRef = null;
    this.interval = null;
    this.__onLayout = this.__onLayout.bind(this);
    this.__onViewRef = this.__onViewRef.bind(this);
  }
  componentDidMount() {
    this.interval = this.__getViewportInterval();
  }
  __isWithin(viewport, top, bottom, left, right, lookAhead) {
    // TODO: <View/>'s will not appear if visible within the region of the soft navigation bar on Android.
    //       We should be using react-native-extra-dimensions, or pass the parent height into this scope.
    return (top >= (-1 * lookAhead)) && (bottom <= (viewport.height + lookAhead));
  }        
  __getViewportInterval() {
    const {
      lookAhead,
      onChange,
      viewport,
    } = this.props;
    return this.setInterval(
      () => {
        if (!!this.viewRef) {
          this.viewRef.measure((x, y, width, height, pageX, pageY) => {
            const visible = this.__isWithin(
              viewport,
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
                () => onChange(visible),
              );
            }
          });
        }
      },
      100,
    );
  }
  componentWillUnmount() {
    this.clearInterval(
      this.interval,
    );
  }
  __onLayout(e) {
    // XXX: This is a hack to ensure Android triggers layout changes.
  }
  __onViewRef(e) {
    this.viewRef = e;
  }
  render() {
    const {
      width,
      height,
      children,
    } = this.props;
    const hackProps = (Platform.OS === 'android') ? ({
       removeClippedSubviews: false,
       collapsable: false,
       renderToHardwareTextureAndroid: true,
     }) : ({});
    return (
      <View
        ref={this.__onViewRef}
        {...hackProps}
        style={{
          width,
          height,
          opacity: 1,
        }}
        onLayout={this.__onLayout}
      >
        {children}
      </View>
    );
  }
}

Object.assign(
  ViewportAware.prototype,
  require('react-timer-mixin'),
);

ViewportAware.propTypes = {
  lookAhead: PropTypes.number.isRequired,
  viewport: PropTypes.shape({}).isRequired,
};

ViewportAware.defaultProps = {
  lookAhead: Dimensions.get('window').height,
};

export class ViewportAwareLottie extends React.Component {
  constructor(nextProps) {
    super(nextProps);
    this.state = {
      visible: false,
      source: null,
    };
    this.interval = null;
  }
  componentDidMount() {
    const {
      url,
    } = this.props;
    const {
      visible,
    } = this.state;
    if (visible && url) {
      this.__cacheUrl(url)
        .catch((e) => {
          // TODO: Elevate to caller.
        });
    }
  } 
  componentWillUpdate(nextProps, nextState) {
    const {
      url,
    } = nextProps;
    const {
      visible,
      source,
      mode,
    } = nextState;
    const urlDidChange = url && (url !== this.props.url);
    const visibilityDidChange = (visible !== this.state.visible);
    if ((urlDidChange && visible) || (visibilityDidChange && visible && url)) {
      this.__cacheUrl(url)
        .catch((e) => {
          // TODO: Elevate to caller.
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
      viewport,
    } = this.props;
    const {
      source,
      visible,
    } = this.state;
    return (
      <ViewportAware
        width={width}
        height={height}
        viewport={viewport}
        onChange={(visible) => this.setState({ visible })}
      >
        <View
          style={{
            width,
            height,
            overflow: 'hidden',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {(!!source) && (
            <Animation
              style={{
                // XXX: These are made as a simplistic way to help
                //      the Lottie animation fill the view.
                width: width * 1.3,
                height: height * 1.3,
              }}
              source={source}
              loop
              autoPlay
            />
          )}
        </View>
      </ViewportAware>
    );
  }
}

ViewportAwareLottie.propTypes = {
  style: PropTypes.shape({}),
  url: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};

ViewportAwareLottie.defaultProps = {
};

class LottieFilesPicker extends React.Component {
  constructor(nextProps) {
    super(nextProps);
    this.state = {
      lottieFilesCrawler: null,
      items: [],
      mode: 'popular',
      page: 1,
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
          mode,
          page,
        } = this.state;
        this.__fetchAnimations(
          mode,
          page,
        );
      });
  }
  componentWillUpdate(nextProps, nextState) {
    const {
      mode,
      page,
    } = nextState;
    if (mode !== this.state.mode) {
      this.__handleModeChange(
        nextProps,
        nextState,
      ); 
    } else if (page !== this.state.page) {
      this.__handlePageChange(
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
      () => this.__fetchAnimations(nextState.mode, 1),
    );
  } 
  __handlePageChange(nextProps, nextState) {
    return this.__fetchAnimations(nextState.mode, nextState.page);
  }
  __getScaledDimensions(maxWidth, width, height) {
    const scale = width / maxWidth;
    return {
      width: maxWidth,
      height: scale * height,
    };
  }
  __renderItem({ item }) {
    const {
      renderLottieFile,
    } = this.props;
    const {
      width,
      height,
      items,
    } = this.state;
    const resolvedWidth = width - (2 * MARGIN_STANDARD);
    const {
      src: uri,
      width: lottieWidth,
      height: lottieHeight,
      path: url,
      href,
      text: user,
      title,
    } = item;
    const {
      width: scaledWidth,
      height: scaledHeight,
    } = this.__getScaledDimensions(
      resolvedWidth,
      Number.parseInt(lottieWidth || resolvedWidth),
      Number.parseInt(lottieHeight || resolvedWidth),
    );
    const RenderLottieFile = ({ ...extraProps }) => (
      <ViewportAwareLottie
        width={scaledWidth}
        height={scaledHeight}
        viewport={{
          width: scaledWidth,
          height: scaledHeight,
        }}
        url={url}
        {...extraProps}
      />
    );
    return renderLottieFile(
      RenderLottieFile,
      item,
      scaledWidth,
      scaledHeight,
    );
  }
  render() {
    const {
      style,
    } = this.props;
    const {
      items,
      refreshing,
      page,
      width,
      mode,
    } = this.state;
    return (
      <View
        style={style || styles.container}
        onLayout={this.__onLayout}
      >
        <View
          style={{
            height: DIM_TOP_BAR,
            flexDirection: 'row',
            backgroundColor: COLOR_LOTTIE_FILES,
          }}
        >
          <TouchableOpacity
            onPress={goToLottieFiles}
            style={{
              width: DIM_TOP_BAR,
              height: DIM_TOP_BAR,
              padding: (DIM_TOP_BAR - DIM_LOGO_HEIGHT) * 0.5,
            }}
          >
            <Image
              style={{
                width: DIM_LOGO_HEIGHT,
                height: DIM_LOGO_HEIGHT,
              }}
              source={{
                uri: getLottieFilesLogo(),
              }}
            />
          </TouchableOpacity>
          <View
            style={{
              flex: 1,
              flexDirection: 'row',
              height: DIM_TOP_BAR,
              paddingRight: MARGIN_SHORT,
              alignItems: 'flex-end',
              justifyContent: 'center',
            }}
          >
            <View
              style={{
                flex: 1,
                height: DIM_TOP_BAR,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                justifyContent: 'flex-end',
              }}
            >
              <TouchableOpacity
                style={{
                  paddingRight: 30,
                }}
                onPress={() => this.setState({ mode: 'popular' })}
              >
                <Icon
                  name="fire"
                  size={32}
                  color={mode === 'popular' ? '#FFFFFFFF' : '#FFFFFFAA' }
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  paddingRight: 30,
                }}
                onPress={() => this.setState({ mode: 'recent' })}
              >
                <Icon
                  name="calendar"
                  size={32}
                  color={mode === 'recent' ? '#FFFFFFFF' : '#FFFFFFAA' }
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => this.setState({ mode: 'featured' })}
              >
                <Icon
                  name="trophy"
                  size={32}
                  color={mode === 'featured' ? '#FFFFFFFF' : '#FFFFFFAA' }
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
        <InfiniteFlatList
          keyExtractor={item => item.path}
          ListHeaderComponent={
            () => (
              <View
                style={{
                  width,
                }}
              >
                <View
                  style={{
                    width,
                    height: MARGIN_STANDARD,
                  }}
                />
              </View>
            )
          }
          ItemSeparatorComponent={
            () => (<View
              style={{
                width,
                height: MARGIN_STANDARD,
              }}
            />)
          }
          ListFooterComponent={
            () => (<View
             style={{
               width,
               height: MARGIN_STANDARD,
             }}
            />)
          }
          data={items}
          renderItem={this.__renderItem}
          loading={refreshing}
          refreshing={refreshing}
          onRefresh={() => {
            const shouldForceRefresh = (page === 1);
            this.setState(
              {
                items: [],
                mode,
                page: 1,
              },
              () => {
                if (shouldForceRefresh) {
                  return this.__fetchAnimations(
                    mode,
                    1,
                  );
                }
                return Promise.resolve();
              },
            );
          }}
          onEndReached={() => {
            this.setState({
              mode,
              page: page + 1,
            });
          }}
          emptyText={mode === 'search' ? 'No Items': ''}
        />
      </View>
    );
  }
}

LottieFilesPicker.propTypes = {
  renderLottieFile: PropTypes.func,
};

LottieFilesPicker.defaultProps = {
  renderLottieFile: (LottieWrapper, { href, user, src: uri, title }, scaledWidth, scaledHeight) => (
    <View
      style={{
        marginLeft: MARGIN_STANDARD,
        width: scaledWidth,
        borderRadius: MARGIN_STANDARD,
        overflow: 'hidden',
        backgroundColor: '#f2f3f4AA',
      }}
    >
      <TouchableOpacity
      >
        <LottieWrapper
        />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => goToArtist(href)}
        style={{
          width: scaledWidth,
          paddingHorizontal: MARGIN_SHORT,
          height: DIM_INFO_BAR,
          flexDirection: 'row',
        }}
      >
        <View
          style={{
            width: DIM_INFO_BAR,
            height: DIM_INFO_BAR,
          }}
        >
          <Image
            style={{
              margin: (DIM_INFO_BAR - DIM_THUMBNAIL) * 0.5,
              width: DIM_THUMBNAIL,
              height: DIM_THUMBNAIL,
              borderRadius: DIM_THUMBNAIL * 0.5,
            }}
            source={{
              uri,
            }}
          />
        </View>
        <View
          style={{
            marginLeft: MARGIN_EXTRA_SHORT,
            paddingTop: MARGIN_EXTRA_SHORT,
            paddingBottom: MARGIN_SHORT,
            flex: 1,
            flexDirection: 'column',
          }}
        >
          <View
            style={{
              width: scaledWidth - (DIM_INFO_BAR + (4 * MARGIN_SHORT)),
              flex: 0.6,
              paddingLeft: MARGIN_EXTRA_SHORT,
              justifyContent: 'center',
            }}
          >
            <Text
              style={{
                marginRight: MARGIN_SHORT,
                width: scaledWidth - (DIM_INFO_BAR + (4 * MARGIN_SHORT)),
                fontSize: 20,
                fontWeight: 'bold',
              }}
              ellipsizeMode="tail"
              numberOfLines={1}
            >
              {title || 'Untitled'}
            </Text>
          </View>
          <View
            style={{
              width: scaledWidth - (DIM_INFO_BAR + (4 * MARGIN_SHORT)),
              flex: 0.4,
              paddingLeft: MARGIN_EXTRA_SHORT,
              justifyContent: 'center',
            }}
          >
            <Text
              style={{
                marginRight: MARGIN_SHORT,
                width: scaledWidth - (DIM_INFO_BAR + (4 * MARGIN_SHORT)),
                fontSize: 14,
              }}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {user || 'An awesome arist!'}
            </Text>
          </View>
          <View
            style={{
              position: 'absolute',
              top: MARGIN_SHORT,
              right: MARGIN_SHORT,
            }}
          >
            <Icon
              color={COLOR_LOTTIE_FILES}
              name="sign-out"
              size={25}
            />
          </View>
        </View>
      </TouchableOpacity>
    </View>
  )
};

export default LottieFilesPicker;
