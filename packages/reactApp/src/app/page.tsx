"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Send, Search } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { AddMessage } from "@/app/components/AddMessage"
import { AllMessages } from "@/app/components/AllMessages"
import { SearchMessages } from "@/app/components/SearchMessages"

export default function MessageBoard() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            {/* Send Message Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="w-5 h-5" />
                  Send Message
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AddMessage />
              </CardContent>
            </Card>

            {/* Search Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  Search Messages
                </CardTitle>
              </CardHeader>
              <CardContent>
                <SearchMessages />
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Messages</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                  <AllMessages />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}