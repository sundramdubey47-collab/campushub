import Link from "next/link"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { AvatarEdit } from "@/components/avatar-edit"
import { EmptyState } from "@/components/empty-state"
import { StatCard } from "@/components/stat-card"
import { LogoutButton } from "@/components/logout-button"
import { PhoneEdit } from "@/components/phone-edit"
import { Button } from "@/components/ui/button"

import {
  FileUp,
  Download,
  Ticket,
  ShoppingBag,
  Bookmark,
  Crown,
  Tag,
  Sparkles,
  GraduationCap
} from "lucide-react"



export default async function ProfilePage(){


  const session = await auth()



  const dbUser = await prisma.user.findUnique({

    where:{
      email:session?.user?.email ?? ""
    },


    include:{


      college:{
        select:{
          name:true
        }
      },


      department:{
        select:{
          name:true
        }
      },


      course:{
        select:{
          name:true
        }
      },


      semester:{
        select:{
          number:true
        }
      },



      uploadedNotes:{

        orderBy:{
          createdAt:"desc"
        },


        select:{
          id:true,
          title:true,
          views:true,
          downloads:true,
          createdAt:true
        }

      },



      coupons:{
        orderBy:{
          createdAt:"desc"
        }
      },



      buyerOrders:{

        orderBy:{
          createdAt:"desc"
        },


        include:{

          listing:{
            select:{
              title:true,
              imageUrl:true
            }
          }

        }

      },



      bookmarks:{

        orderBy:{
          createdAt:"desc"
        },


        include:{

          note:{
            select:{
              id:true,
              title:true
            }
          }

        }

      }



    }

  })




  if(!dbUser){

    return (

      <p className="
        text-red-500
        text-sm
      ">

        Could not load profile

      </p>

    )

  }




  const totalDownloadsReceived =
    dbUser.uploadedNotes.reduce(
      (sum,n)=>sum+n.downloads,
      0
    )



  const initials =
    dbUser.name
    .split(" ")
    .map(n=>n[0])
    .slice(0,2)
    .join("")
    .toUpperCase()





  return (

    <div className="
      mx-auto
      max-w-5xl
      space-y-8
      pb-10
    ">



      {/* Profile Hero */}


      <div className="
        rounded-3xl
        border
        bg-gradient-to-br
        from-primary/10
        via-card
        to-card
        p-6
      ">


        <div className="
          flex
          flex-col
          sm:flex-row
          gap-5
          items-start
        ">

<AvatarEdit initialUrl={dbUser.avatarUrl} initials={initials} />



          <div className="
            flex-1
            min-w-0
          ">


            <h1 className="
              text-2xl
              font-bold
            ">

              {dbUser.name}

            </h1>


            <p className="
              text-sm
              text-muted-foreground
            ">

              {dbUser.email}

            </p>


            <div className="mt-3">

              <PhoneEdit
                initialPhone={dbUser.phone}
              />

            </div>


            <div className="
              flex
              flex-wrap
              gap-2
              mt-4
            ">


              <span className="
                rounded-full
                bg-muted
                px-3
                py-1
                text-xs
              ">

                {dbUser.role}

              </span>



              {
                dbUser.isPremium && (

                  <span className="
                    flex
                    items-center
                    gap-1
                    rounded-full
                    bg-yellow-500/15
                    px-3
                    py-1
                    text-xs
                    text-yellow-600
                  ">

                    <Crown className="h-3 w-3"/>

                    Premium

                  </span>

                )
              }



            </div>



          </div>




          <LogoutButton />



        </div>


      </div>
            {/* Premium Upgrade Banner */}

      {!dbUser.isPremium && (

        <div className="
          rounded-3xl
          border
          border-yellow-500/30
          bg-gradient-to-r
          from-yellow-500/10
          to-transparent
          p-5
          flex
          flex-col
          sm:flex-row
          items-start
          sm:items-center
          justify-between
          gap-4
        ">


          <div className="
            flex
            items-center
            gap-3
          ">


            <div className="
              rounded-2xl
              bg-yellow-500/20
              p-3
            ">

              <Sparkles className="
                h-5
                w-5
                text-yellow-600
              "/>

            </div>



            <div>

              <p className="
                font-semibold
              ">

                Unlock CampusHub Premium

              </p>


              <p className="
                text-sm
                text-muted-foreground
              ">

                Access premium notes, tests and exclusive resources

              </p>


            </div>



          </div>





          <Link href="/premium">

            <Button
              size="sm"
              className="
                bg-yellow-500
                hover:bg-yellow-600
                text-black
              "
            >

              <Crown className="
                h-4
                w-4
                mr-1.5
              "/>


              View Plans


            </Button>


          </Link>



        </div>

      )}







      {/* Stats */}



      <div className="
        grid
        grid-cols-2
        lg:grid-cols-4
        gap-4
      ">



        <StatCard

          label="Uploads"

          value={
            dbUser.uploadedNotes.length
          }

          icon={FileUp}

        />



        <StatCard

          label="Downloads"

          value={
            totalDownloadsReceived
          }

          icon={Download}

        />



        <StatCard

          label="Coupons"

          value={
            dbUser.coupons.length
          }

          icon={Ticket}

        />



        <StatCard

          label="Orders"

          value={
            dbUser.buyerOrders.length
          }

          icon={ShoppingBag}

        />


      </div>







      {/* Academic Details */}



      <div className="
        rounded-3xl
        border
        bg-card
        p-5
      ">


        <h2 className="
          font-semibold
          mb-4
          flex
          items-center
          gap-2
        ">

          <GraduationCap className="
            h-5
            w-5
          "/>


          Academic Profile


        </h2>




        <div className="
          grid
          grid-cols-1
          sm:grid-cols-2
          gap-3
        ">



          {
            dbUser.college && (

              <div className="
                rounded-xl
                bg-muted/50
                p-3
              ">


                <p className="
                  text-xs
                  text-muted-foreground
                ">

                  College

                </p>


                <p className="font-medium">

                  {dbUser.college.name}

                </p>


              </div>

            )
          }






          {
            dbUser.course && (

              <div className="
                rounded-xl
                bg-muted/50
                p-3
              ">


                <p className="
                  text-xs
                  text-muted-foreground
                ">

                  Course

                </p>


                <p className="font-medium">

                  {dbUser.course.name}

                </p>


              </div>

            )
          }







          {
            dbUser.semester && (

              <div className="
                rounded-xl
                bg-muted/50
                p-3
              ">


                <p className="
                  text-xs
                  text-muted-foreground
                ">

                  Semester

                </p>


                <p className="font-medium">

                  Semester {dbUser.semester.number}

                </p>


              </div>

            )
          }






          {
            dbUser.department && (

              <div className="
                rounded-xl
                bg-muted/50
                p-3
              ">


                <p className="
                  text-xs
                  text-muted-foreground
                ">

                  Department

                </p>


                <p className="font-medium">

                  {dbUser.department.name}

                </p>


              </div>

            )
          }



        </div>


      </div>
      
      {/* My Uploads */}


      <section className="
        space-y-4
      ">


        <h2 className="
          text-lg
          font-semibold
          flex
          items-center
          gap-2
        ">


          <FileUp className="
            h-5
            w-5
          "/>


          My Uploads


        </h2>





        {
          dbUser.uploadedNotes.length === 0 ? (


            <EmptyState

              icon={FileUp}

              title="No uploads yet"

              description="Share your notes and help other students"

            />


          ) : (



            <div className="
              grid
              gap-3
            ">


              {
                dbUser.uploadedNotes.map((note)=>(


                  <Link

                    key={note.id}

                    href={`/notes/${note.id}`}

                  >



                    <div className="
                      group
                      rounded-2xl
                      border
                      bg-card
                      p-4
                      flex
                      items-center
                      justify-between
                      gap-3
                      hover:border-primary
                      hover:shadow-sm
                      transition
                    ">


                      <div className="
                        min-w-0
                      ">


                        <p className="
                          font-medium
                          truncate
                        ">

                          {note.title}

                        </p>



                        <p className="
                          text-xs
                          text-muted-foreground
                          mt-1
                        ">


                          Uploaded resource


                        </p>


                      </div>





                      <div className="
                        text-right
                        shrink-0
                      ">


                        <p className="
                          text-xs
                          text-muted-foreground
                        ">

                          {note.views} views

                        </p>


                        <p className="
                          text-xs
                          text-muted-foreground
                        ">

                          {note.downloads} downloads

                        </p>


                      </div>



                    </div>


                  </Link>


                ))
              }



            </div>


          )
        }



      </section>







      {/* Coupons */}



      <section className="
        space-y-4
      ">



        <h2 className="
          text-lg
          font-semibold
          flex
          items-center
          gap-2
        ">


          <Tag className="
            h-5
            w-5
          "/>


          My Coupons


        </h2>







        {
          dbUser.coupons.length === 0 ? (


            <EmptyState

              icon={Tag}

              title="No coupons yet"

              description="Earn coupons when your resources get premium downloads"

            />


          ) : (


            <div className="
              grid
              sm:grid-cols-2
              gap-3
            ">



              {
                dbUser.coupons.map((coupon)=>(


                  <div

                    key={coupon.id}

                    className="
                      rounded-2xl
                      border
                      bg-card
                      p-4
                    "

                  >



                    <div className="
                      flex
                      items-center
                      justify-between
                    ">



                      <span className="
                        font-mono
                        font-semibold
                      ">

                        {coupon.code}

                      </span>





                      <span className="
                        text-sm
                        font-bold
                      ">

                        {coupon.discountPercent}% OFF

                      </span>


                    </div>






                    <div className="
                      mt-3
                    ">


                      <span
                        className={`
                          text-xs
                          px-3
                          py-1
                          rounded-full
                          ${
                            coupon.isUsed
                            ?
                            "bg-muted text-muted-foreground"
                            :
                            "bg-green-500/15 text-green-600"
                          }
                        `}
                      >


                        {
                          coupon.isUsed
                          ?
                          "Used"
                          :
                          "Available"
                        }


                      </span>


                    </div>




                  </div>


                ))
              }



            </div>


          )
        }




      </section>
      
      {/* My Orders */}


      <section className="
        space-y-4
      ">



        <h2 className="
          text-lg
          font-semibold
          flex
          items-center
          gap-2
        ">


          <ShoppingBag className="
            h-5
            w-5
          "/>


          My Orders


        </h2>





        {
          dbUser.buyerOrders.length === 0 ? (


            <EmptyState

              icon={ShoppingBag}

              title="No orders yet"

              description="Explore marketplace items and place your first order"

            />


          ) : (



            <div className="
              grid
              gap-3
            ">



              {
                dbUser.buyerOrders.map((order)=>(



                  <div

                    key={order.id}

                    className="
                      rounded-2xl
                      border
                      bg-card
                      p-4
                      flex
                      items-center
                      gap-4
                      hover:shadow-sm
                      transition
                    "

                  >



                    {
                      order.listing.imageUrl && (


                        <img

                          src={order.listing.imageUrl}

                          alt=""

                          className="
                            h-14
                            w-14
                            rounded-xl
                            object-cover
                          "

                        />


                      )
                    }






                    <div className="
                      flex-1
                      min-w-0
                    ">


                      <p className="
                        font-medium
                        truncate
                      ">


                        {order.listing.title}


                      </p>


                      <p className="
                        text-xs
                        text-muted-foreground
                      ">


                        Marketplace order


                      </p>



                    </div>






                    {
                      order.finalPrice && (


                        <span className="
                          font-bold
                          text-sm
                        ">


                          ₹{order.finalPrice}


                        </span>


                      )
                    }



                  </div>



                ))
              }



            </div>


          )
        }



      </section>









      {/* Bookmarked Resources */}




      <section className="
        space-y-4
      ">



        <h2 className="
          text-lg
          font-semibold
          flex
          items-center
          gap-2
        ">



          <Bookmark className="
            h-5
            w-5
          "/>



          Saved Resources



        </h2>






        {
          dbUser.bookmarks.length === 0 ? (


            <EmptyState

              icon={Bookmark}

              title="No bookmarks yet"

              description="Save important notes and resources for later"

            />


          ) : (



            <div className="
              grid
              gap-3
            ">




              {
                dbUser.bookmarks.map((bookmark)=>(



                  <Link

                    key={bookmark.id}

                    href={`/notes/${bookmark.note.id}`}

                  >



                    <div className="
                      rounded-2xl
                      border
                      bg-card
                      p-4
                      hover:border-primary
                      hover:shadow-sm
                      transition
                    ">



                      <p className="
                        font-medium
                      ">


                        {bookmark.note.title}


                      </p>



                      <p className="
                        text-xs
                        text-muted-foreground
                        mt-1
                      ">


                        Click to open resource


                      </p>



                    </div>



                  </Link>



                ))
              }





            </div>


          )
        }



      </section>





    </div>

  )

}