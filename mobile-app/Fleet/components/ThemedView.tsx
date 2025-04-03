import { View, type ViewProps } from 'react-native';
import { useColorScheme } from 'react-native';
import Colors from '../constants/Colors';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

export default function ThemedView({ style, lightColor, darkColor, ...otherProps }: ThemedViewProps) {
  const colorScheme = useColorScheme() || 'light';
  const backgroundColor = lightColor
    ? colorScheme === 'light' ? lightColor : darkColor
    : colorScheme === 'light' ? Colors.light.background : Colors.dark.background;

  return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}
