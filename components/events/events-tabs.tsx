"use client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { type Event } from "@/lib/interfaces"
import { formatEventDate } from "@/lib/utils"
import { AddToCalendar } from "./add-to-calendar"
import Link from "next/link"

const upcomingEvents: Event[] = []

const pastEvents: Event[] = [
  {
    name: "SScholarship award day",
    description: "a day designated to the issuance of scholarship award to successful applicants.",
    date: "2025-04-05 08:00",
    endDate: "2025-04-06 14:30",
    location: "Ozalla, Isuofia",
    place: "SB 107",
    timezone: "America/Chicago",
    link: "https://www.linkedin.com/posts/"
  },
  {
    name: "Get Together",
    description: "A day designated to meet and eat and have fun.",
    date: "2025-02-27 12:45",
    endDate: "2025-02-27 14:00",
    location: "Ozalla, Isuofia",
    place: "SB 111",
    timezone: "America/Chicago",
    link: "https://www.linkedin.com/"
  },
  {
    name: "Annual Meeting",
    date: "2025-02-08 11:30",
    description: "Polish your Resume and Elevator Pitch with insights from industry experts to boost your career.",
    endDate: "2025-02-08 16:00",
    location: "Online",
    place: "Online",
    timezone: "America/Chicago",
    link: null
  }
]

export function EventsTabs() {
  return (
    <Tabs defaultValue={upcomingEvents.length > 0 ? "upcoming" : "past"} className="font-raleway w-full max-w-4xl mx-auto">
      <TabsList className="grid w-full grid-cols-2 mb-8">
        <TabsTrigger
          value="upcoming"
          className="data-[state=active]:bg-fontcolor data-[state=active]:text-background rounded-full"
        >
          UPCOMING
        </TabsTrigger>
        <TabsTrigger value="past" className="data-[state=active]:bg-fontcolor data-[state=active]:text-background rounded-full">
          PAST
        </TabsTrigger>
      </TabsList>

      <TabsContent value="upcoming" className="space-y-4">
        {upcomingEvents.length > 0 ? upcomingEvents.map((event, index) => (
          <div key={index} className="font-raleway flex items-start justify-between p-6 border-b">
            <div className="space-y-2 max-w-1/2 lg:max-w-[calc(100%-200px)]">
              <h3 className="text-2xl text-fontcolor font-bold">{event.name}</h3>
              <p className="text-light-red">{formatEventDate(event.date)}</p>
              <p className="text-gray-600">{event.description}</p>
              { event.link && <p className="mt-2"><Link href={event.link} target="_blank" className="pb-2 border-b border-light-red text-light-red">Learn More</Link></p> }
            </div>
            <AddToCalendar {...event} />
          </div>
        )) : <div className="flex items-center justify-center p-6 h-24"><h3 className="text-lg">Stay tuned... We&apos;re working on it.</h3></div>}
      </TabsContent>

      <TabsContent value="past" className="space-y-4">
        {pastEvents.map((event, index) => (
          <div key={index} className="font-raleway flex items-start justify-between p-6 border-b">
            <div className="space-y-2">
              <h3 className="text-2xl text-fontcolor font-bold">{event.name}</h3>
              <p className="text-gray font-bold">{formatEventDate(event.date)}</p>
              <p className="text-gray">{event.description}</p>
            </div>
          </div>
        ))}
      </TabsContent>
    </Tabs>
  )
}