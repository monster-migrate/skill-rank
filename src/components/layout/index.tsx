import { JSX } from "react";
import Navigation from "../navigation";
interface PropsInterface {
    children: React.ReactNode;
}
const Layout = (props: PropsInterface): JSX.Element => {
    return <div className="bg-neutral-200 w-screen">
        <div>
            <Navigation />
            <main className="p-2 flex flex-col justify-center items-center">
                {props.children}
            </main>
        </div>
    </div>
}

export default Layout;