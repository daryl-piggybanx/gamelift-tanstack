import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuIndicator,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
    NavigationMenuViewport,
} from "~/components/ui/navigation-menu"

import logo from '~/assets/Logo-Bolt-White.png'
import { Link } from "@tanstack/react-router"

export function Navbar() {
    return (
        <NavigationMenu className="flex justify-between items-center p-4">
            <NavigationMenuList className="flex justify-between items-center w-full">
                <NavigationMenuItem className="flex justify-between items-center w-full">
                <Link to="/">
                            <img src={logo} alt="PiggyBanx Logo" width={24} height={24} />
                        </Link>
                </NavigationMenuItem>
                <NavigationMenuItem className="flex justify-between items-center w-full">
                <Link to="/streams">
                            <h1>Streams</h1>
                        </Link>
                </NavigationMenuItem>
            </NavigationMenuList>
        </NavigationMenu>
    )
}