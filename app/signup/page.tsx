"use client"

import { useState, Suspense } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { signIn } from "next-auth/react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CampusHubLogo } from "@/components/campushub-logo"


function SignupForm(){

  const router = useRouter()
  const searchParams = useSearchParams()

  const referralCode = searchParams.get("ref")


  const [honeypot,setHoneypot] = useState("")

  const [name,setName] = useState("")
  const [email,setEmail] = useState("")
  const [password,setPassword] = useState("")

  const [showPassword,setShowPassword] = useState(false)

  const [agreed,setAgreed] = useState(false)

  const [error,setError] = useState("")
  const [loading,setLoading] = useState(false)



  async function handleSubmit(e:React.FormEvent){

    e.preventDefault()


    if(honeypot){
      return
    }


    setError("")


    if(!agreed){

      setError(
        "Please agree to Terms and Privacy Policy"
      )

      return
    }


    setLoading(true)


    const res = await fetch("/api/signup",{

      method:"POST",

      headers:{
        "Content-Type":"application/json"
      },

      body:JSON.stringify({
        name,
        email,
        password,
        referralCode
      })

    })


    const data = await res.json()


    setLoading(false)



    if(!res.ok){

      setError(data.error)

      return

    }


    router.push("/login")

  }




  return (

<main className="
min-h-screen
flex
items-center
justify-center
px-4
py-10
bg-gradient-to-br
from-primary/10
via-background
to-muted
">


<div className="
w-full
max-w-6xl
grid
lg:grid-cols-2
gap-10
items-center
">



{/* LEFT BRAND SECTION */}

<div className="
hidden
lg:flex
flex-col
space-y-8
px-8
">


<div className="
flex
items-center
gap-3
">

<div className="
rounded-2xl
bg-background
p-3
shadow-lg
">

<CampusHubLogo className="h-14 w-14"/>

</div>


<div>

<h1 className="
text-3xl
font-bold
">
CampusHub
</h1>


<p className="
text-muted-foreground
">
Your digital campus ecosystem
</p>


</div>


</div>



<h2 className="
text-5xl
font-bold
leading-tight
">

Connect.
<br/>

Learn.
<br/>

Grow.

</h2>


<p className="
text-muted-foreground
text-lg
max-w-md
">

Join thousands of students building
connections, discovering opportunities
and growing together.

</p>



<div className="
grid
gap-4
">

<div className="
rounded-2xl
border
bg-card/60
p-4
">

<p className="font-semibold">
🎓 Campus Community
</p>

<p className="
text-sm
text-muted-foreground
">
Connect with students and colleges
</p>

</div>


<div className="
rounded-2xl
border
bg-card/60
p-4
">

<p className="font-semibold">
🚀 Opportunities
</p>

<p className="
text-sm
text-muted-foreground
">
Discover events, skills and growth
</p>

</div>


</div>


</div>



{/* RIGHT FORM */}

<div className="w-full max-w-md mx-auto">


<div className="
lg:hidden
flex
flex-col
items-center
mb-6
">

<CampusHubLogo className="h-12 w-12"/>

</div>



<form
onSubmit={handleSubmit}
className="
rounded-3xl
border
bg-card/80
backdrop-blur-xl
p-8
shadow-2xl
space-y-5
"
>
            {error && (

            <div className="
              rounded-xl
              bg-red-500/10
              border
              border-red-500/20
              px-4
              py-3
              text-sm
              text-red-500
              text-center
            ">
              {error}
            </div>

          )}



          {referralCode && (

            <div className="
              rounded-xl
              bg-primary/10
              border
              border-primary/20
              px-4
              py-3
              text-center
              text-sm
              text-primary
            ">

              🎁 Referral code applied:
              <strong className="ml-1">
                {referralCode}
              </strong>

            </div>

          )}




          {/* Name */}

          <div className="space-y-2">

            <Label htmlFor="name">
              Full Name
            </Label>


            <Input

              id="name"

              placeholder="Enter your full name"

              value={name}

              onChange={(e)=>
                setName(e.target.value)
              }

              required

              className="
                h-12
                rounded-xl
                bg-background/60
              "

            />

          </div>





          {/* Email */}

          <div className="space-y-2">

            <Label htmlFor="email">
              Email Address
            </Label>


            <Input

              id="email"

              type="email"

              placeholder="student@example.com"

              value={email}

              onChange={(e)=>
                setEmail(e.target.value)
              }

              required

              className="
                h-12
                rounded-xl
                bg-background/60
              "

            />

          </div>






          {/* Password */}

          <div className="space-y-2">


            <div className="
              flex
              justify-between
              items-center
            ">

              <Label htmlFor="password">
                Password
              </Label>


              <button

                type="button"

                onClick={()=>
                  setShowPassword(!showPassword)
                }

                className="
                  text-xs
                  text-primary
                  hover:underline
                "

              >

                {showPassword
                  ? "Hide"
                  : "Show"
                }

              </button>


            </div>




            <Input

              id="password"

              type={
                showPassword
                ? "text"
                : "password"
              }

              placeholder="Create a strong password"

              value={password}

              onChange={(e)=>
                setPassword(e.target.value)
              }

              required

              className="
                h-12
                rounded-xl
                bg-background/60
              "

            />


            {password && (

              <div className="
                space-y-2
                pt-1
              ">

                <div className="
                  h-1.5
                  rounded-full
                  bg-muted
                  overflow-hidden
                ">

                  <div

                    className={`
                      h-full
                      rounded-full
                      transition-all

                      ${
                        password.length < 6
                        ? "w-1/3 bg-red-500"

                        : password.length < 10
                        ? "w-2/3 bg-yellow-500"

                        : "w-full bg-green-500"
                      }

                    `}

                  />

                </div>


                <p className="
                  text-xs
                  text-muted-foreground
                ">

                  {password.length < 6
                    ? "Weak password"

                    : password.length < 10
                    ? "Good password"

                    : "Strong password 🔥"
                  }

                </p>


              </div>

            )}



          </div>





          {/* Terms */}

          <div className="
            flex
            items-start
            gap-3
          ">


            <input

              type="checkbox"

              id="agree"

              checked={agreed}

              onChange={(e)=>
                setAgreed(e.target.checked)
              }

              className="
                mt-1
                h-4
                w-4
                rounded
              "

            />



            <label

              htmlFor="agree"

              className="
                text-xs
                text-muted-foreground
                leading-relaxed
              "

            >

              I agree to the{" "}


              <Link

                href="/terms"

                className="
                  text-primary
                  underline
                "

              >

                Terms of Service

              </Link>


              {" "}and{" "}


              <Link

                href="/privacy"

                className="
                  text-primary
                  underline
                "

              >

                Privacy Policy

              </Link>


            </label>


          </div>





          {/* Honeypot */}

          <input

            type="text"

            name="website"

            value={honeypot}

            onChange={(e)=>
              setHoneypot(e.target.value)
            }

            style={{
              position:"absolute",
              left:"-9999px"
            }}

            tabIndex={-1}

            autoComplete="off"

          />
                    {/* Submit Button */}

          <Button

            type="submit"

            disabled={loading}

            className="
              w-full
              h-12
              rounded-xl
              text-sm
              font-semibold
              transition-all
              hover:scale-[1.02]
            "

          >

            {loading ? (

              <span className="
                flex
                items-center
                gap-2
              ">

                <span className="
                  h-4
                  w-4
                  rounded-full
                  border-2
                  border-background
                  border-t-transparent
                  animate-spin
                "/>


                Creating account...

              </span>

            ) : (

              "Create CampusHub Account 🚀"

            )}

          </Button>





          {/* Divider */}

          <div className="
            relative
            py-2
          ">


            <div className="
              absolute
              inset-0
              flex
              items-center
            ">

              <span className="
                w-full
                border-t
              "/>

            </div>



            <div className="
              relative
              flex
              justify-center
            ">

              <span className="
                bg-card
                px-3
                text-xs
                text-muted-foreground
              ">

                OR CONTINUE WITH

              </span>

            </div>


          </div>





          {/* Google Login */}

          <Button

            type="button"

            variant="outline"

            className="
              w-full
              h-12
              rounded-xl
              font-medium
              transition-all
              hover:bg-muted
            "

            onClick={()=>
              signIn(
                "google",
                {
                  callbackUrl:"/dashboard"
                }
              )
            }

          >

            <svg
              className="
                mr-2
                h-5
                w-5
              "
              viewBox="0 0 24 24"
            >

              <path
                fill="currentColor"
                d="M21.35 12.27c0-.75-.07-1.47-.21-2.16H12v4.09h5.23a4.47 4.47 0 0 1-1.94 2.93v2.43h3.14c1.84-1.7 2.92-4.2 2.92-7.29Z"
              />

            </svg>


            Continue with Google


          </Button>





          {/* Security Badge */}

          <div className="
            grid
            grid-cols-3
            gap-2
            pt-3
          ">


            <div className="
              rounded-xl
              bg-muted/50
              p-3
              text-center
            ">

              <p className="text-lg">
                🔒
              </p>

              <p className="
                text-[10px]
                text-muted-foreground
              ">
                Secure
              </p>

            </div>



            <div className="
              rounded-xl
              bg-muted/50
              p-3
              text-center
            ">

              <p className="text-lg">
                ⚡
              </p>

              <p className="
                text-[10px]
                text-muted-foreground
              ">
                Fast
              </p>

            </div>



            <div className="
              rounded-xl
              bg-muted/50
              p-3
              text-center
            ">

              <p className="text-lg">
                🌎
              </p>

              <p className="
                text-[10px]
                text-muted-foreground
              ">
                Global
              </p>

            </div>


          </div>




        </form>
{/* Login Link */}

<div className="
  mt-4
  rounded-2xl
  border
  bg-primary/5
  p-4
  text-center
">

  <p className="
    text-sm
    text-muted-foreground
  ">

    Already have a CampusHub account?

  </p>


  <Link

    href="/login"

    className="
      mt-3
      inline-flex
      w-full
      items-center
      justify-center
      rounded-xl
      bg-primary
      px-4
      py-3
      text-sm
      font-semibold
      text-primary-foreground
      shadow-md
      transition-all
      hover:scale-[1.02]
      hover:shadow-lg
    "

  >

    Login to CampusHub →

  </Link>


</div>
      </div>


    </div>


  </main>

  )

}





export default function SignupPage(){

  return (

    <Suspense fallback={null}>

      <SignupForm />

    </Suspense>

  )

}