"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Combobox } from "@/components/combobox"
import { EmptyState } from "@/components/empty-state"

import {
  Package,
  Plus,
  History,
  Search,
  IndianRupee,
  User,
  ShieldCheck,
} from "lucide-react"


const CATEGORY_OPTIONS = [
  { value: "BOOKS", label: "Books" },
  { value: "LAPTOP", label: "Laptop" },
  { value: "PROJECTOR", label: "Projector" },
  { value: "CALCULATOR", label: "Calculator" },
  { value: "CAMERA", label: "Camera" },
  { value: "CYCLE", label: "Cycle" },
  { value: "FURNITURE", label: "Furniture" },
  { value: "OTHER", label: "Other" },
]


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
  }
}



export function RentalsClient({
  initialItems,
}: {
  initialItems: Item[]
}) {

  const [allItems] = useState<Item[]>(initialItems)
  const [items, setItems] = useState<Item[]>(initialItems)

  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("")



  function applyFilters() {

    let filtered = allItems


    if (search.trim()) {

      const q = search.toLowerCase()

      filtered = filtered.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.description?.toLowerCase().includes(q)
      )

    }


    if (category) {

      filtered = filtered.filter(
        (i) => i.category === category
      )

    }


    setItems(filtered)

  }



  return (

    <div className="space-y-8">


      {/* Header */}

      <div className="
        flex
        flex-col
        gap-4
        md:flex-row
        md:items-center
        md:justify-between
      ">


        <div>

          <h1 className="
            text-3xl
            font-bold
            tracking-tight
          ">
            Campus Rentals
          </h1>


          <p className="
            mt-1
            text-muted-foreground
          ">
            Rent useful items from students around your college
          </p>


        </div>



        <div className="flex gap-2">


          <Link href="/rentals/my-bookings">

            <Button variant="outline">

              <History className="mr-2 h-4 w-4"/>

              My Rentals

            </Button>

          </Link>



          <Link href="/rentals/create">

            <Button>

              <Plus className="mr-2 h-4 w-4"/>

              List Item

            </Button>

          </Link>


        </div>


      </div>





      {/* Search */}

      <div className="
        rounded-2xl
        border
        bg-card
        p-4
        shadow-sm
      ">


        <div className="
          flex
          flex-col
          gap-3
          md:flex-row
        ">


          <div className="relative flex-1">


            <Search
              className="
                absolute
                left-3
                top-1/2
                h-4 w-4
                -translate-y-1/2
                text-muted-foreground
              "
            />


            <Input

              placeholder="Search books, laptop, cycle..."

              value={search}

              onChange={(e)=>setSearch(e.target.value)}

              className="pl-10 h-11"

            />


          </div>



          <Combobox

            placeholder="All Categories"

            value={category}

            onChange={setCategory}

            options={CATEGORY_OPTIONS}

          />


          <Button
            onClick={applyFilters}
            className="h-11 px-8"
          >

            Search

          </Button>


        </div>


      </div>






      {/* Items */}


      {
        items.length === 0 ? (

          <EmptyState

            icon={Package}

            title="No rentals available"

            description="Try another search or add your own item"

            action={

              <Link href="/rentals/create">

                <Button>

                  <Plus className="mr-2 h-4 w-4"/>

                  List Item

                </Button>

              </Link>

            }

          />


        ) : (


          <div className="
            grid
            grid-cols-1
            sm:grid-cols-2
            lg:grid-cols-3
            gap-6
          ">


          {
            items.map((item,index)=>(


              <motion.div

                key={item.id}

                initial={{
                  opacity:0,
                  y:20
                }}

                animate={{
                  opacity:1,
                  y:0
                }}

                transition={{
                  delay:index*0.05
                }}

              >


              <Link href={`/rentals/${item.id}`}>


                <div className="
                  group
                  overflow-hidden
                  rounded-3xl
                  border
                  bg-card
                  shadow-sm
                  transition
                  hover:-translate-y-1
                  hover:shadow-xl
                ">



                  <div className="
                    relative
                    aspect-video
                    bg-muted
                    overflow-hidden
                  ">


                    {
                      item.imageUrl ? (

                        <img

                          src={item.imageUrl}

                          alt={item.title}

                          className="
                            h-full
                            w-full
                            object-cover
                            transition
                            duration-300
                            group-hover:scale-105
                          "

                        />

                      ) : (

                        <div className="
                          flex
                          h-full
                          items-center
                          justify-center
                        ">

                          <Package
                            className="
                              h-12
                              w-12
                              text-muted-foreground
                            "
                          />

                        </div>

                      )

                    }


                  </div>




                  <div className="p-5 space-y-3">



                    <div className="
                      flex
                      items-start
                      justify-between
                    ">


                      <h2 className="
                        font-semibold
                        text-lg
                        line-clamp-1
                      ">

                        {item.title}

                      </h2>


                    </div>




                    {
                      item.description && (

                        <p className="
                          text-sm
                          text-muted-foreground
                          line-clamp-2
                        ">

                          {item.description}

                        </p>

                      )
                    }




                    <div className="
                      flex
                      items-center
                      gap-1
                      text-xl
                      font-bold
                    ">

                      <IndianRupee className="h-4 w-4"/>

                      {item.price}


                      <span className="
                        text-sm
                        font-normal
                        text-muted-foreground
                      ">

                        / {item.pricingType.toLowerCase()}

                      </span>


                    </div>




                    <div className="
                      flex
                      items-center
                      justify-between
                      border-t
                      pt-3
                      text-xs
                      text-muted-foreground
                    ">


                      <span className="flex gap-1 items-center">

                        <User className="h-3 w-3"/>

                        {item.owner.name}

                      </span>



                      <span className="flex gap-1 items-center">

                        <ShieldCheck className="h-3 w-3"/>

                        Verified

                      </span>


                    </div>



                  </div>



                </div>


              </Link>


              </motion.div>


            ))
          }


          </div>


        )

      }


    </div>

  )
}