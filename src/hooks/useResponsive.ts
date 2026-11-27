import { useWindowDimensions } from 'react-native';

export type Breakpoint = 'mobile' | 'tablet' | 'desktop';

export const BREAKPOINTS = {
  tablet: 768,
  desktop: 1024,
  maxContentWidth: 1200,
};

export interface ResponsiveInfo {
  width: number;
  height: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isWideScreen: boolean; // tablet or desktop
  breakpoint: Breakpoint;
  contentMaxWidth: number;
}

export function useResponsive(): ResponsiveInfo {
  const { width, height } = useWindowDimensions();

  const isDesktop = width >= BREAKPOINTS.desktop;
  const isTablet = width >= BREAKPOINTS.tablet && width < BREAKPOINTS.desktop;
  const isMobile = width < BREAKPOINTS.tablet;
  const isWideScreen = width >= BREAKPOINTS.tablet;

  const breakpoint: Breakpoint = isDesktop ? 'desktop' : isTablet ? 'tablet' : 'mobile';

  return {
    width,
    height,
    isMobile,
    isTablet,
    isDesktop,
    isWideScreen,
    breakpoint,
    contentMaxWidth: BREAKPOINTS.maxContentWidth,
  };
}
