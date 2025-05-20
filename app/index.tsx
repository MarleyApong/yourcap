import React, { useRef, useEffect, useState } from "react"
import { Dimensions, FlatList, ImageBackground, Text, View } from "react-native"
import { Link } from "expo-router"

const { width: screenWidth, height: screenHeight } = Dimensions.get("window")

const slides = [
  {
    image: require("@/assets/images/bg/2148578098.jpg"),
    title: "Never forget who owes you again",
  },
  {
    image: require("@/assets/images/bg/6986.jpg"),
    title: "Track debts effortlessly",
  },
  {
    image: require("@/assets/images/bg/9126.jpg"),
    title: "Stay organized with ease",
  },
]

export default function CarouselScreen() {
  const flatListRef = useRef<FlatList>(null)
  const [currentIndex, setCurrentIndex] = useState(0)

  // Auto-scroll
  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex = (currentIndex + 1) % slides.length
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true })
      setCurrentIndex(nextIndex)
    }, 4000) // toutes les 4 secondes

    return () => clearInterval(interval)
  }, [currentIndex])

  const renderItem = ({ item }: { item: (typeof slides)[0] }) => (
    <ImageBackground
      source={item.image}
      style={{ width: screenWidth, height: screenHeight }}
      resizeMode="cover"
      className="relative"
    >
      {/* Overlay sombre */}
      <View className="absolute inset-0 bg-black/60" />

      {/* Titre */}
      <View className="flex-1 justify-center items-start px-10">
        <Text className="text-white text-5xl font-bold">{item.title}</Text>
      </View>
    </ImageBackground>
  )

  return (
    <View className="flex-1 relative">
      {/* Carousel */}
      <FlatList
        ref={flatListRef}
        data={slides}
        keyExtractor={(_, index) => index.toString()}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false} // on empêche le scroll manuel pour garder le contrôle
      />

      {/* Boutons fixes */}
      <View className="absolute bottom-10 left-0 right-0 px-10">
        <Link href="/auth/login" className="bg-white/20 p-4 rounded-xl w-full">
          <Text className="text-center text-white font-semibold text-lg">Sign in</Text>
        </Link>
        <Link href="/auth/register" className="w-full mt-4">
          <Text className="text-center text-white font-semibold text-lg">Create an account</Text>
        </Link>
      </View>
    </View>
  )
}
