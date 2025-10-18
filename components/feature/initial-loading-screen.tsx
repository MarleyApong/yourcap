import { useTwColors } from '@/lib/tw-colors'
import React from 'react'
import { Text, View } from 'react-native'

export const InitialLoadingScreen: React.FC = () => {
  const { twColor } = useTwColors()
  
  return (
    <View style={{ backgroundColor: twColor("background") }} className="flex-1 justify-center items-center">
      <View 
        style={{ backgroundColor: twColor("primary") }} 
        className="rounded-xl p-6 items-center"
      >
        <Text style={{ color: twColor("primary-foreground") }} className="text-lg">
          Chargement...
        </Text>
      </View>
    </View>
  )
}