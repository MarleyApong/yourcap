declare module "react-native-keyboard-aware-scroll-view" {
  import * as React from "react"
  import { ScrollViewProps } from "react-native"

  export interface KeyboardAwareScrollViewProps extends ScrollViewProps {
    enableOnAndroid?: boolean
    extraHeight?: number
    extraScrollHeight?: number
    keyboardOpeningTime?: number
    enableAutomaticScroll?: boolean
    onKeyboardWillShow?: (frames: Object) => void
    onKeyboardWillHide?: (frames: Object) => void
    onKeyboardDidShow?: (frames: Object) => void
    onKeyboardDidHide?: (frames: Object) => void
  }

  export class KeyboardAwareScrollView extends React.Component<
    KeyboardAwareScrollViewProps
  > {}
}
