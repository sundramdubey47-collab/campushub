"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import {
  Phone,
  ShieldCheck,
  CalendarDays,
  IndianRupee,
  Package,
  User,
  BadgeCheck,
} from "lucide-react"



type Item = {
  id: number
  title: string
  description: string | null
  category: string
  pricingType: string
  price: number
  securityDeposit: number
  imageUrl: string | null
  owner: {
    name: string
    phone: string | null
  }
}



export default function RentalDetailPage() {

  const params = useParams()

  const itemId = params.id


  const [item, setItem] = useState<Item | null>(null)

  const [startDate,setStartDate] = useState("")
  const [expectedReturnDate,setExpectedReturnDate] = useState("")
  const [couponCode,setCouponCode] = useState("")

  const [error,setError] = useState("")
  const [loading,setLoading] = useState(false)
  const [requested,setRequested] = useState(false)



  useEffect(()=>{

    fetch(`/api/rentals/${itemId}`)
      .then((r)=>r.json())
      .then(setItem)

  },[itemId])




  async function handleRequest(){

    setError("")


    if(!startDate || !expectedReturnDate){

      setError("Please select both dates")
      return

    }


    setLoading(true)



    const res = await fetch(
      `/api/rentals/${itemId}/book`,
      {
        method:"POST",
        headers:{
          "Content-Type":"application/json"
        },
        body:JSON.stringify({
          startDate,
          expectedReturnDate,
          couponCode:couponCode || undefined
        })
      }
    )



    const data = await res.json()


    setLoading(false)



    if(!res.ok){

      setError(data.error)
      return

    }



    setRequested(true)


  }





  if(!item){

    return (

      <div className="
        flex
        min-h-[300px]
        items-center
        justify-center
        text-muted-foreground
      ">

        Loading rental...

      </div>

    )

  }





  return (

    <div className="
      mx-auto
      max-w-5xl
      space-y-8
      pb-10
    ">



      {/* Image */}


      <div className="
        overflow-hidden
        rounded-3xl
        border
        bg-card
        shadow-sm
      ">


        {
          item.imageUrl ? (

            <img

              src={item.imageUrl}

              alt={item.title}

              className="
                h-[320px]
                w-full
                object-cover
              "

            />

          ) : (

            <div className="
              flex
              h-[320px]
              items-center
              justify-center
              bg-muted
            ">

              <Package className="
                h-20
                w-20
                text-muted-foreground
              "/>


            </div>

          )
        }


      </div>







      <div className="
        grid
        gap-6
        lg:grid-cols-[1fr_380px]
      ">



        {/* Details */}


        <div className="space-y-5">



          <div>


            <h1 className="
              text-3xl
              font-bold
            ">

              {item.title}

            </h1>



            {
              item.description && (

                <p className="
                  mt-3
                  text-muted-foreground
                  leading-relaxed
                ">

                  {item.description}

                </p>

              )
            }


          </div>






          <div className="
            flex
            flex-wrap
            gap-3
          ">


            <span className="
              rounded-full
              bg-muted
              px-4
              py-2
              text-sm
            ">

              {item.category}

            </span>



            <span className="
              flex
              items-center
              gap-1
              rounded-full
              bg-primary/10
              px-4
              py-2
              text-sm
              font-medium
            ">


              <IndianRupee className="h-3 w-3"/>

              {item.price}

              /
              {item.pricingType.toLowerCase()}


            </span>



            {
              item.securityDeposit>0 && (

                <span className="
                  rounded-full
                  bg-muted
                  px-4
                  py-2
                  text-sm
                ">

                  Deposit ₹{item.securityDeposit}

                </span>

              )
            }


          </div>








          {/* Owner */}


          <div className="
            rounded-3xl
            border
            bg-card
            p-5
          ">


            <div className="
              flex
              items-center
              gap-3
            ">


              <div className="
                flex
                h-12
                w-12
                items-center
                justify-center
                rounded-full
                bg-primary/10
              ">

                <User className="text-primary"/>

              </div>



              <div>

                <p className="font-semibold">

                  {item.owner.name}

                </p>


                <p className="
                  flex
                  items-center
                  gap-1
                  text-xs
                  text-muted-foreground
                ">


                  <BadgeCheck className="h-3 w-3"/>

                  Verified Student


                </p>


              </div>


            </div>





            {
              item.owner.phone && (

                <p className="
                  mt-4
                  flex
                  items-center
                  gap-2
                  text-sm
                ">

                  <Phone className="h-4 w-4"/>

                  {item.owner.phone}

                </p>

              )
            }


          </div>



        </div>








        {/* Booking */}


        <div>


        {
          requested ? (

            <div className="
              rounded-3xl
              border
              bg-green-500/10
              p-6
            ">


              <h3 className="
                font-semibold
                text-green-600
              ">

                Request Sent ✅

              </h3>


              <p className="
                mt-2
                text-sm
                text-muted-foreground
              ">

                Owner will review your rental request.
                Check My Rentals for updates.

              </p>


            </div>


          ) : (


            <div className="
              sticky
              top-5
              rounded-3xl
              border
              bg-card
              p-6
              shadow-sm
              space-y-4
            ">



              <h2 className="
                text-xl
                font-bold
              ">

                Request Rental

              </h2>




              <div className="space-y-2">

                <Label>

                  Start Date

                </Label>

                <Input

                  type="date"

                  value={startDate}

                  onChange={(e)=>setStartDate(e.target.value)}

                />

              </div>





              <div className="space-y-2">

                <Label>

                  Return Date

                </Label>

                <Input

                  type="date"

                  value={expectedReturnDate}

                  onChange={(e)=>setExpectedReturnDate(e.target.value)}

                />

              </div>





              <div className="space-y-2">

                <Label>

                  Coupon Code

                </Label>

                <Input

                  placeholder="CH-XXXXXXXX"

                  value={couponCode}

                  onChange={(e)=>setCouponCode(e.target.value)}

                />

              </div>





              {
                error && (

                  <p className="
                    text-sm
                    text-red-500
                  ">

                    {error}

                  </p>

                )
              }





              <Button

                className="
                  w-full
                  h-12
                "

                onClick={handleRequest}

                disabled={loading}

              >

                {
                  loading
                  ? "Sending Request..."
                  : "Request to Rent"
                }


              </Button>




              <p className="
                flex
                items-center
                justify-center
                gap-1
                text-xs
                text-muted-foreground
              ">

                <ShieldCheck className="h-3 w-3"/>

                Secure campus rental

              </p>


            </div>


          )
        }


        </div>


      </div>


    </div>

  )

}