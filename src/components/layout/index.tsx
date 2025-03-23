import { JSX } from "react";
import Navigation from "../navigation";
interface PropsInterface {
    children: React.ReactNode;
}
const Layout = (props: PropsInterface): JSX.Element => {
    return <div className="flex">
        <div className="flex-1">
            <Navigation />
            <main className="p-2">
                {props.children}
            </main>
        </div>
    </div>
}

export default Layout;