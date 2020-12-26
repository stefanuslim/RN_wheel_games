import React from 'react';
import {
  StyleSheet,
  View,
  Text as RNText,
  Dimensions,
  Animated,
} from 'react-native';
import * as d3Shape from 'd3-shape';
import { snap } from '@popmotion/popcorn';
import Svg, { Path, G, Image} from 'react-native-svg'
import { State, PanGestureHandler } from 'react-native-gesture-handler'
const { width } = Dimensions.get('window');

const numberOfSegments = 7
const wheelSize = width * 0.95
const oneTurn = 360
const angleBySegment = oneTurn / numberOfSegments
const angleOffset = angleBySegment / 2
const knobFill = "red"

const urlLogo = [
  {
    id:1,
    url: "https://i2.wp.com/lalumiere-aesthetics.com/wp-content/uploads/2019/08/WhatsApp-Image-2019-08-09-at-12.38.39.jpeg?fit=1280%2C1280&ssl=1",
    value: "La Lumiere"
  },
  {
    id:2,
    url: "https://lh3.googleusercontent.com/proxy/-0VwupFisVYsk9AZ11MDL-8hMpM5aO-iHWxjs0yppFQqj6lRvOikj2CGEQgDD4QgoC5GB1ERtyk6lKLGjLY6aYuzQWLly-ffZ3anbIMo5Bipucrmg8RFsWdNqSK6QSRiascH0wQ",
    value: "Primarasa"
  },
  {
    id:3,
    url: "https://lh3.googleusercontent.com/proxy/VIxCM3UamyZZEm0H09tN_XOIAWsGhfJlSvxfjqXM80eSzPJ5gDrVof6Imr_KrQ-wb6C-tZKaAIyLQlOuhyFVB_ddE364V09hgL-UaqVt8YD01YT-PSAtX_TGCoznsf_3Ixi8atPMRdwR92ISJ0Mt",
    value: "KartikaSari"
  },
  {
    id:4,
    url: "https://lh3.googleusercontent.com/proxy/vayKQ-Z-odt-K-bT8MLPTnddgHVtTSyf7-4CR-Go1X92kRy8vu9YTW8QNIFS8NE1K4P89RY4qMsQ6WLkwP33IJK3D7COrgAI94I0Bw8dxK0pcrZ1sJsclJuMpkFv2Mo",
    value: "Gokana"
  },
  {
    id:5,
    url: "https://www.linkaja.id/uploads/images/merchant/solaria.png",
    value: "Solaria"
  },
  {
    id:6,
    url: "https://i.pinimg.com/originals/5a/f4/2b/5af42b2e31010a24ac46d2cb5a0e60a6.png",
    value: "DunkinDonuts"
  },
  {
    id:7,
    url: "https://upload.wikimedia.org/wikipedia/id/3/3d/Yoshinoya_logo.jpg",
    value: "Yoshinoya"
  }
]

const generateWheel = () => {
  const data = Array.from({ length: numberOfSegments }).fill(1)
  const arcs = d3Shape.pie()(data)
  const colors = ["grey","blue","red","pink","green","yellow","cyan"]

  return arcs.map((arc, index) => {
    const instance = d3Shape
      .arc()
      .padAngle(0.005)
      .outerRadius(width / 2)
      .innerRadius(20)
      
    return {
      path: instance(arc),
      color: colors[index],
      value: urlLogo[index],
      centroid: instance.centroid(arc)
    };
  });
};


class App extends React.Component {
  wheelPaths = generateWheel()
  angle = new Animated.Value(0)
  angleValue = 0

  state = {
    enabled: true,
    finished: false,
    winner: null
  };

  componentDidMount() {
    this.angle.addListener(event => {
      if (this.state.enabled) {
        this.setState({
          enabled: false,
          finished: false
        })
      }

      this.angleValue = event.value
    })
  }

  getWinnerIndex(){
    const deg = Math.abs(Math.round(this.angleValue % oneTurn))
    if(this.angleValue < 0) {
      return Math.floor(deg / angleBySegment)
    }
    return (numberOfSegments - Math.floor(deg / angleBySegment)) % numberOfSegments
  }

  onPan = ({ nativeEvent }) => {
    if (nativeEvent.state === State.END) {
      const { velocityY } = nativeEvent

      Animated.decay(this.angle, {
        velocity: velocityY / 1000,
        deceleration: 0.999,
        useNativeDriver: true
      }).start(() => {
        this.angle.setValue(this.angleValue % oneTurn)
        const snapTo = snap(oneTurn / numberOfSegments)
        Animated.timing(this.angle, {
          toValue: snapTo(this.angleValue),
          duration: 300,
          useNativeDriver: true
        }).start(() => {
          const winnerIndex = this.getWinnerIndex()
          this.setState({
            enabled: true,
            finished: true,
            winner: this.wheelPaths[winnerIndex].value.value
          })
        })
      })
    }
  }

  render() {
    return (
      <PanGestureHandler
        onHandlerStateChange={this.onPan}
        enabled={this.state.enabled}
      >
        <View style={styles.container}>
          {this.renderSvgWheel()}
          {this.state.finished && this.state.enabled && this.renderWinner()}
        </View>
      </PanGestureHandler>
    );
  }

  renderKnob = () => {
    const knobSize = 30;
    const YOLO = Animated.modulo(
      Animated.divide(
        Animated.modulo(Animated.subtract(this.angle, angleOffset), oneTurn),
        new Animated.Value(angleBySegment)
      ),
      1
    )

    return (
      <Animated.View
        style={{
          width: knobSize,
          height: knobSize * 2,
          justifyContent: 'flex-end',
          zIndex: 1,
          transform: [
            {
              rotate: YOLO.interpolate({
                inputRange: [-1, -0.5, -0.0001, 0.0001, 0.5, 1],
                outputRange: ['0deg', '0deg', '35deg', '-35deg', '0deg', '0deg']
              })
            }
          ]
        }}
      >
        <Svg
          width={knobSize}
          height={(knobSize * 100) / 57}
          viewBox={`0 0 57 100`}
          style={{ transform: [{ translateY: 8 }] }}
        >
          <Path
            d="M28.034,0C12.552,0,0,12.552,0,28.034S28.034,100,28.034,100s28.034-56.483,28.034-71.966S43.517,0,28.034,0z   M28.034,40.477c-6.871,0-12.442-5.572-12.442-12.442c0-6.872,5.571-12.442,12.442-12.442c6.872,0,12.442,5.57,12.442,12.442  C40.477,34.905,34.906,40.477,28.034,40.477z"
            fill={knobFill}
          />
        </Svg>
      </Animated.View>
    )
  }

  renderWinner = () => {
    return (
      <RNText style={styles.winnerText}>Winner is: {this.state.winner}</RNText>
    )
  }

  renderSvgWheel = () => {
    return (
      <View style={styles.container}>
        <RNText style={styles.title}>Spin it !!!</RNText>
        {this.renderKnob()}
        <Animated.View
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            transform: [
              {
                rotate: this.angle.interpolate({
                  inputRange: [-oneTurn, 0, oneTurn],
                  outputRange: [`-${oneTurn}deg`, `0deg`, `${oneTurn}deg`]
                })
              }
            ]
          }}
        >
          <Svg
            width={wheelSize}
            height={wheelSize}
            viewBox={`0 0 ${width} ${width}`}
            style={{ transform: [{ rotate: `-${angleOffset}deg` }] }}
          >
            <G y={width / 2} x={width / 2}>
              {this.wheelPaths.map((arc, i) => {
                const [x, y] = arc.centroid;

                return (
                  <G key={`arc-${i}`}>
                    <Path d={arc.path} fill={arc.color} />
                    <G
                      rotation={(i * oneTurn) / numberOfSegments + angleOffset}
                      origin={`${x}, ${y}`}
                    >
                      <Image
                        x={x - 30}
                        y={y - 50}
                        width={60}
                        height={60}
                        opacity="1"
                        href={{uri:arc.value.url}}
                      />
                    </G>
                  </G>
                );
              })}
            </G>
          </Svg>
        </Animated.View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center'
  },
  title: {
    fontSize:24,
  },
  winnerText: {
    fontSize: 32,
    position: 'absolute',
    bottom: 10
  }
});

export default App
