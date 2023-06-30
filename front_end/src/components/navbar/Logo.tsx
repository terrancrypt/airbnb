import Image from "next/image"
import Link from "next/link"

const Logo = () =>{

    return (
        <Link
        href="/"
        >
        <Image
        src="/images/logo.png"
        alt="logo"
        className="hidden md:block cursor-pointer"
        height={100}
        width={100}
        />
        </Link>
        
    )

}

export default Logo