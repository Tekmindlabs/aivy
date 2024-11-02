'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

const colors = ['text-blue-500', 'text-green-500', 'text-purple-500', 'text-pink-500', 'text-yellow-500', 'text-red-500']

function useTextMorph(items: string[], interval: number = 2000) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % items.length)
    }, interval)
    return () => clearInterval(timer)
  }, [items, interval])

  return items[index]
}

export default function Footer() {
  const morphingColor = useTextMorph(colors)

  return (
    <footer className="sticky bottom-0 left-0 right-0 flex justify-center items-center p-4 mt-auto">
      <div className="bg-background/80 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg">
        <span className="text-sm sm:text-base text-muted-foreground">
          Powered by{' '}
          <span className={`font-semibold ${morphingColor}`}>
            FabriiQ
          </span>
        </span>
      </div>
    </footer>
  )
}