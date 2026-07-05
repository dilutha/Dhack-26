"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Lightbulb, Brush, Pointer, Package } from "lucide-react";
import { WORKSHOPS } from "@/lib/constants";

const Workshops = () => {
  const iconMap = {
    Lightbulb,
    Brush,
    Pointer,
    Package,
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut",
      },
    },
  };

  const cardHoverVariants = {
    hover: {
      scale: 1.05,
      rotateY: 5,
      transition: {
        duration: 0.3,
        ease: "easeInOut",
      },
    },
  };

  return (
    <section id="workshops" className="py-20 relative overflow-x-hidden">
      <div className="max-w-1200 mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
          className="text-center mb-16"
        >
          <motion.h2
            variants={itemVariants}
            className="text-4xl md:text-5xl font-heading font-bold mb-6"
          >
            Workshop <span className="gradient-text">Series</span>
          </motion.h2>
          <motion.div
            variants={itemVariants}
            className="w-24 h-1 bg-gradient-to-r from-dhack-orange to-dhack-teal mx-auto mb-8"
          />
          <motion.p
            variants={itemVariants}
            className="text-lg text-muted-foreground max-w-2xl mx-auto description-text"
          >
            Master the essential skills for modern design with our comprehensive
            workshop series. Learn from industry experts and get hands-on
            experience with cutting-edge tools and techniques.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          {WORKSHOPS.map((workshop, index) => {
            const IconComponent =
              iconMap[workshop.icon as keyof typeof iconMap];
            const colors = [
              "from-orange-500 to-red-500",
              "from-blue-500 to-cyan-500",
              "from-purple-500 to-pink-500",
              "from-green-500 to-teal-500",
            ];

            return (
              <motion.div
                key={workshop.name}
                variants={itemVariants}
                whileHover="hover"
                className="group perspective-1000"
              >
                <motion.div variants={cardHoverVariants}>
                  <Card className="h-full bg-background/50 border-dhack-teal/30 hover:border-dhack-orange/50 transition-all duration-500 backdrop-blur-sm relative overflow-hidden group-hover:shadow-2xl">
                    {/* Diagonal gradient overlay */}
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${colors[index]} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
                    />

                    {/* Animated background pattern */}
                    <div className="absolute inset-0 opacity-5">
                      <div className="absolute top-4 right-4 w-32 h-32 border border-dhack-teal/30 rounded-full group-hover:scale-150 transition-transform duration-700" />
                      <div className="absolute bottom-4 left-4 w-24 h-24 border border-dhack-orange/30 rounded-full group-hover:scale-125 transition-transform duration-700" />
                    </div>

                    <CardHeader className="text-center relative z-10">
                      <div className="mx-auto mb-6 relative">
                        <motion.div
                          className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${colors[index]} p-5 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg`}
                          whileHover={{
                            boxShadow: "0 20px 40px rgba(30, 192, 195, 0.3)",
                          }}
                        >
                          <IconComponent className="w-full h-full text-white" />
                        </motion.div>

                        {/* Floating particles effect */}
                        <div
                          className="absolute -top-2 -right-2 w-3 h-3 bg-dhack-teal rounded-full group-hover:animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        />
                        <div
                          className="absolute -bottom-2 -left-2 w-2 h-2 bg-dhack-orange rounded-full group-hover:animate-bounce"
                          style={{ animationDelay: "0.3s" }}
                        />
                      </div>

                      <CardTitle className="text-2xl md:text-3xl mb-3 group-hover:text-dhack-teal transition-colors duration-300">
                        {workshop.name}
                      </CardTitle>
                    </CardHeader>

                    <CardContent className="relative z-10">
                      <CardDescription className="text-muted-foreground text-center text-lg leading-relaxed group-hover:text-foreground transition-colors duration-300">
                        {workshop.description}
                      </CardDescription>

                      {/* Progress bar */}
                      <div className="mt-6 w-full bg-background/50 rounded-full h-2 overflow-hidden">
                        <motion.div
                          className={`h-full bg-gradient-to-r ${colors[index]} rounded-full`}
                          initial={{ width: "0%" }}
                          whileInView={{ width: "100%" }}
                          transition={{ duration: 1, delay: index * 0.2 }}
                          viewport={{ once: true }}
                        />
                      </div>

                      <p className="text-center text-sm text-muted-foreground mt-2 group-hover:text-dhack-teal transition-colors duration-300">
                        Workshop {index + 1} of {WORKSHOPS.length}
                      </p>
                    </CardContent>

                    {/* Glowing border effect */}
                    <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-dhack-orange via-dhack-teal to-dhack-accent opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-sm" />
                  </Card>
                </motion.div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* Animated background shapes */}
      <div className="absolute top-1/4 left-0 w-64 h-64 bg-dhack-orange/5 rounded-full blur-3xl animate-float" />
      <div
        className="absolute bottom-1/4 right-0 w-64 h-64 bg-dhack-teal/5 rounded-full blur-3xl animate-float"
        style={{ animationDelay: "3s" }}
      />
      <div
        className="absolute top-3/4 left-1/3 w-32 h-32 bg-dhack-accent/5 rounded-full blur-2xl animate-float"
        style={{ animationDelay: "1.5s" }}
      />
    </section>
  );
};

export default Workshops;
