import { CSSProperties } from 'react';
import styles from './Divider.module.css';

interface DividerProps {
  /** Orientation of the divider */
  orientation?: 'horizontal' | 'vertical';
  /** Scale/thickness multiplier */
  scale?: number;
  /** Custom CSS classes */
  className?: string;
  /** Custom inline styles */
  style?: CSSProperties;
  /** Opacity/fading effect */
  opacity?: number;
  /** Color of the divider */
  color?: string;
  /** Length of the divider */
  length?: string | number;
}

export const Divider = ({
  orientation = 'horizontal',
  scale = 1,
  className = '',
  style = {},
  opacity = 0.2,
  color = 'currentColor',
  length = '100%',
}: DividerProps) => {
  const isHorizontal = orientation === 'horizontal';

  const dividerStyle: CSSProperties = {
    ...style,
    color,
    opacity,
    [isHorizontal ? 'width' : 'height']: length,
    '--divider-scale': `${scale}`,
  } as CSSProperties & { '--divider-scale': string };

  return (
    <div
      className={`${styles.divider} ${styles[orientation]} ${className}`}
      style={dividerStyle}
      role="separator"
      aria-orientation={orientation}
    />
  );
};
