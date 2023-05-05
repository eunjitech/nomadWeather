import React, { useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import * as Location from "expo-location";

import {
  StyleSheet,
  Text,
  View,
  Vibration,
  Button,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { Fontisto } from "@expo/vector-icons";
const { width: SCREEN_WIDTH } = Dimensions.get("window");

const API_KEY = "031cf902b809ab18f757380d59cb719e"; //서버에 두어야 안전함
const icons = {
  Clouds: "cloudy",
  Rain: "rain",
  Clear: "day-sunny",
};

export default function App() {
  const [ok, setOk] = useState(true);
  const [city, setCity] = useState(null);
  const [days, setDays] = useState([]);

  const getWeather = async () => {
    const { granted } = await Location.requestForegroundPermissionsAsync(); //위치정보승인
    if (!granted) {
      setOk(false);
    }
    const {
      coords: { latitude, longitude },
    } = await Location.getCurrentPositionAsync({ accuracy: 5 }); //위도 경도
    const location = await Location.reverseGeocodeAsync(
      { latitude, longitude },
      { useGoogleMaps: false }
    );
    setCity(location[0].city);
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/onecall?lat=${latitude}&lon=${longitude}&exclude=alerts&appid=${API_KEY}&units=metric`
    ); //날씨정보 가져옴
    const json = await response.json();
    console.log("json", json);
    setDays(json.daily); //데일리 날씨 정보를 state에 담음
  };

  useEffect(() => {
    getWeather();
  }, []);

  return (
    <View style={styles.container}>
      {/* <StatusBar style="dark" /> */}
      <View style={styles.city}>
        <Text style={styles.cityName}>
          {city === null ? <ActivityIndicator /> : city}
        </Text>
      </View>
      <ScrollView
        pagingEnabled
        horizontal
        contentContainerStyle={styles.weather}
        showsHorizontalScrollIndicator={false} //iOS전용
      >
        {days.length === 0 ? (
          <View style={styles.day}>
            <ActivityIndicator />
            {/* 로딩바표시 */}
          </View>
        ) : (
          days.map((day, index) => (
            <View key={index} style={styles.day}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "flex-start",
                  justifyContent: "center",
                  width: "100%",
                }}
              >
                <Text style={styles.temp}>
                  {parseFloat(day.temp.day).toFixed(1)}
                </Text>
                <Fontisto
                  name={icons[day.weather[0].main]}
                  size={68}
                  color="white"
                />
              </View>
              <Text style={styles.description}>{day.weather[0].main}</Text>
              <Text style={styles.tinyText}>{day.weather[0].description}</Text>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "navy",
  },
  text: {
    color: "#fff",
  },
  city: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  cityName: {
    color: "#fff",
    fontSize: 58,
    fontWeight: 500,
    textAlign: "center",
  },
  day: {
    marginLeft: 10,
    marginRight: 10,
    width: SCREEN_WIDTH - 20,
    alignItems: "center",
    // borderWidth: 1,
    // borderColor: "black",
    // backgroundColor: "yellow",
  },
  temp: { fontSize: 100, fontWeight: 500, color: "#fff" },
  description: { fontSize: 30, fontWeight: 400, color: "#fff" },
  tinyText: { fontSize: 20, color: "#fff" },
});
