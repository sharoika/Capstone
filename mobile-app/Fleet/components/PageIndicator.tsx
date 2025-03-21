import React from 'react';
import { View } from 'react-native';

interface Props {
  currentPage: number;
  styles: any;
}

const PageIndicator: React.FC<Props> = ({ currentPage, styles }) => (
  <View style={styles.pageIndicator}>
    {[1, 2, 3].map((page) => (
      <View key={page} style={[styles.indicatorDot, currentPage >= page && styles.activeDot]} />
    ))}
  </View>
);

export default PageIndicator;
