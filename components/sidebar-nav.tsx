"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import { HelpCircle, CheckCircle2, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

import {
  LayoutDashboard,
  FileText,
  Bell,
  ShoppingBag,
  User,
  Calendar,
  Search,
  Package,
  ShieldCheck,
  Crown,
  MessageCircle,
  Brain,
  Gift,
  Sparkles
} from "lucide-react"



const links = [

  {
    href:"/dashboard",
    label:"Dashboard",
    icon:LayoutDashboard
  },


  {
    href:"/notes",
    label:"Resources",
    icon:FileText
  },
{ href: "/notes/requests", label: "Requests", icon: HelpCircle },

  {
    href:"/notices",
    label:"Notices",
    icon:Bell
  },

{ href: "/timetable", label: "Timetable", icon: Clock },

  {
    href:"/events",
    label:"Events",
    icon:Calendar
  },


  {
    href:"/marketplace",
    label:"Marketplace",
    icon:ShoppingBag
  },


  {
    href:"/rentals",
    label:"Rentals",
    icon:Package
  },


  {
    href:"/lost-found",
    label:"Lost & Found",
    icon:Search
  },


  {
    href:"/tests",
    label:"AI Tests",
    icon:Brain
  },


  {
    href:"/ai-assistant",
    label:"AI Assistant",
    icon:MessageCircle
  },


  {
    href:"/premium",
    label:"Premium",
    icon:Crown,
    premium:true
  },


  {
    href:"/profile",
    label:"Profile",
    icon:User
  },


  {
    href:"/referrals",
    label:"Invite Friends",
    icon:Gift
  }

]





export function SidebarNav(){


  const pathname = usePathname()


  const {data:session}=useSession()



  const role =
    (session?.user as any)?.role





  const isAdmin =
    [
      "ADMIN",
      "SUPER_ADMIN"
    ].includes(role)




  const isSuperAdmin =
    role==="SUPER_ADMIN"


console.log("Session:", session)
console.log("Role:", role)
console.log("isAdmin:", isAdmin)
console.log("isSuperAdmin:", role === "SUPER_ADMIN")

  let allLinks:any[]=links



  if(isAdmin){

    allLinks=[

      ...allLinks,

      {
        href:"/admin",
        label:"Admin Panel",
        icon:ShieldCheck
      }

    ]

  }

if (isAdmin || role === "FACULTY") allLinks = [...allLinks, { href: "/admin/timetable", label: "Timetable", icon: Clock }]

  if(isSuperAdmin){

    allLinks=[

      ...allLinks,

      {
        href:"/super-admin",
        label:"Super Admin",
        icon:Crown
      }

    ]

  }





  return (

    <nav className="
      flex
      flex-col
      gap-1.5
      p-4
    ">


      <p className="
        text-[11px]
        font-semibold
        uppercase
        tracking-wider
        text-muted-foreground
        px-3
        mb-2
      ">

        CampusHub

      </p>
      
      {
        allLinks.map((link)=>{


          const Icon = link.icon


          const active =
            pathname === link.href



          return (


            <Link


              key={link.href}


              href={link.href}


              className={cn(

                `
                group
                relative
                flex
                items-center
                gap-3
                rounded-2xl
                px-3
                py-2.5
                text-sm
                font-medium
                transition-all
                duration-200
                `,



                active

                ?

                `
                bg-primary
                text-primary-foreground
                shadow-md
                shadow-primary/20
                `


                :


                `
                text-muted-foreground
                hover:bg-muted
                hover:text-foreground
                hover:translate-x-1
                `



              )}



            >




              {/* Active Indicator */}


              {
                active && (

                  <span className="
                    absolute
                    left-0
                    h-7
                    w-1
                    rounded-r-full
                    bg-white/80
                  "/>

                )
              }







              <div className={cn(

                `
                flex
                h-8
                w-8
                items-center
                justify-center
                rounded-xl
                transition
                `,


                active

                ?

                "bg-white/20"

                :

                "bg-muted group-hover:bg-background"


              )}>



                <Icon className="
                  h-4
                  w-4
                "/>


              </div>






              <span className="
                flex-1
              ">

                {link.label}

              </span>







              {
                link.premium && (


                  <span className="
                    flex
                    items-center
                    gap-1
                    rounded-full
                    bg-yellow-500/15
                    px-2
                    py-0.5
                    text-[10px]
                    font-semibold
                    text-yellow-600
                  ">


                    <Sparkles className="
                      h-3
                      w-3
                    "/>


                    PRO


                  </span>


                )
              }







              {
                link.href === "/admin" && (


                  <span className="
                    rounded-full
                    bg-red-500/10
                    px-2
                    py-0.5
                    text-[10px]
                    text-red-500
                  ">

                    ADMIN

                  </span>


                )
              }






            </Link>


          )

        })
      }



    </nav>


  )

}
