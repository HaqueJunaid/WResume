import { usePuterStore } from "lib/puter"
import { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router";

export const meta = () => ([
    { title: 'WResume | Auth'},
    { name: 'description', content: 'Login to your WResume account'},
])

const auth = () => {
    const {isLoading, auth} = usePuterStore();
    const location = useLocation();
    const next = location.search.split('next=')[1];
    const navigate = useNavigate();

    useEffect(() => {
        if (auth.isAuthenticated) {
            navigate(next);
        }
    }, [auth.isAuthenticated, next])

  return (
    <main className="bg-[url('/images/bg-auth.svg')] bg-cover bg-center min-h-screen flex items-center justify-center">
        <Link to={"#"} className="absolute left-10 top-10">
            <p className='text-2xl font-bold text-gradient'>WResume</p>
        </Link>
        <div className="gradient-border shadow-lg">
            <section className="flex flex-col gap-8 bg-white rounded-2xl p-10">
                <div className="flex flex-col gap-2 items-center text-center">
                    <h1>Welcome</h1>
                    <h2 >Login to your account with putter.js and start analysing your resume</h2>
                </div>
                <div className="flex mx-auto w-fit">
                    {isLoading
                    ?
                    ( <button className="auth-button animate-pulse">Signing in...</button> )
                    :
                    (
                        <>
                        {auth.isAuthenticated
                        ?
                        (
                            <button className="auth-button" onClick={auth.signOut}><p>Log Out</p></button>
                        )
                        :
                        (
                            <button className="auth-button" onClick={auth.signIn}><p>Log In</p></button>
                        )}
                        </>
                    )}
                </div>
            </section>
        </div>
    </main>
  )
}

export default auth