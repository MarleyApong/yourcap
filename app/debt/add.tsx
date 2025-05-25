import { useState } from "react"
import { View, Text, TextInput, Button } from "react-native"
import { useRouter } from "expo-router"

export default function AddDebt() {
  const [name, setName] = useState("")
  const [amount, setAmount] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [note, setNote] = useState("")
  const router = useRouter()

  const handleSubmit = () => {
    // enregistrer dans le backend (API ou localStorage temporaire)
    router.push("/dashboard")
  }

  return (
    <View className="p-4 bg-white flex-1">
      <Text className="text-2xl font-bold mb-4">Nouvelle Dette</Text>

      <TextInput placeholder="Nom du débiteur" className="border p-2 rounded mb-4" value={name} onChangeText={setName} />
      <TextInput placeholder="Montant" className="border p-2 rounded mb-4" keyboardType="numeric" value={amount} onChangeText={setAmount} />
      <TextInput placeholder="Date limite (YYYY-MM-DD)" className="border p-2 rounded mb-4" value={dueDate} onChangeText={setDueDate} />
      <TextInput placeholder="Note (facultatif)" className="border p-2 rounded mb-4" value={note} onChangeText={setNote} multiline numberOfLines={3} />

      <Button title="Ajouter" onPress={handleSubmit} />
    </View>
  )
}
