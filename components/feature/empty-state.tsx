import { useTwColors } from "@/lib/tw-colors"
import { Feather } from "@expo/vector-icons"
import { Image, Pressable, Text, View } from "react-native"

interface EmptyStateProps {
  title: string
  description: string
  buttonText?: string
  onButtonPress?: () => void
  image?: any
  icon?: string
  showCard?: boolean
}

export const EmptyState = ({ title, description, buttonText, onButtonPress, image, icon = "inbox", showCard = true }: EmptyStateProps) => {
  const { twColor } = useTwColors()

  const content = (
    <>
      {image ? (
        <Image source={image} className="w-32 h-32 opacity-50" />
      ) : (
        <View
          style={{
            backgroundColor: `${twColor("muted")}50`,
          }}
          className="p-6 rounded-full"
        >
          <Feather name={icon as any} size={48} color={twColor("muted-foreground")} />
        </View>
      )}

      <Text style={{ color: twColor("foreground") }} className="text-lg font-semibold mt-6 text-center">
        {title}
      </Text>

      <Text style={{ color: twColor("muted-foreground") }} className="mt-2 text-center leading-5">
        {description}
      </Text>

      {buttonText && onButtonPress && (
        <Pressable onPress={onButtonPress} style={{ backgroundColor: twColor("primary") }} className="mt-6 px-6 py-3 rounded-full shadow-sm">
          <Text style={{ color: twColor("primary-foreground") }} className="font-semibold">
            {buttonText}
          </Text>
        </Pressable>
      )}
    </>
  )

  if (!showCard) {
    return <View className="flex-1 items-center justify-center py-8 px-6">{content}</View>
  }

  return (
    <View
      style={{
        backgroundColor: twColor("card-background"),
        borderColor: twColor("border"),
      }}
      className="rounded-xl p-8 shadow-sm items-center justify-center border"
    >
      {content}
    </View>
  )
}
