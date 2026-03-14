import { type ComponentProps, forwardRef } from 'react'

import { NavLink as NavigationNavLink } from '@/shared/lib/navigation'

type NavLinkProps = ComponentProps<typeof NavigationNavLink>

const NavLink = forwardRef<HTMLAnchorElement, NavLinkProps>((props, ref) => <NavigationNavLink ref={ref as never} {...props} />)

NavLink.displayName = 'NavLink'

export { NavLink }
