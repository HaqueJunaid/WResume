import React from 'react'
import { Link } from 'react-router'

const Navbar = () => {
  return (
    <nav className='navbar'>
        <Link to={"/"}>
            <p className='text-2xl font-bold text-gradient'>WResume</p>
        </Link>
        <Link to={"/upload"} className='primary-button w-fit'>
            <span className='sm:block md:hidden'>Upload</span>
            <span className='hidden md:block'>Upload Resume</span>
        </Link>
    </nav>
  )
}

export default Navbar