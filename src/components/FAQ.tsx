'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { FAQS_2026 } from '@/lib/dhack2026';

const FAQ = () => {
  const faqs = FAQS_2026;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: 'easeOut',
      },
    },
  };

  return (
    <section id='faq' className='py-16 relative overflow-x-hidden'>
      <div className='max-w-1200 mx-auto px-4 sm:px-6 lg:px-8'>
        <motion.div
          initial='hidden'
          whileInView='visible'
          viewport={{ once: true, margin: '-100px' }}
          variants={containerVariants}
          className='text-center mb-16'
        >
          <motion.h2
            variants={itemVariants}
            className='text-4xl md:text-5xl font-heading font-bold mb-6'
          >
            Frequently Asked <span className='gradient-text'>Questions</span>
          </motion.h2>
          <motion.div
            variants={itemVariants}
            className='w-24 h-1 bg-gradient-to-r from-dhack-orange to-dhack-teal mx-auto mb-8'
          />
          <motion.p
            variants={itemVariants}
            className='text-lg text-muted-foreground max-w-2xl mx-auto description-text'
          >
            Got questions? Here are the essentials for DHACK&apos;26 teams,
            schools, and ReBrand participants.
          </motion.p>
        </motion.div>

        <motion.div
          initial='hidden'
          whileInView='visible'
          viewport={{ once: true, margin: '-100px' }}
          variants={containerVariants}
          className='space-y-4'
        >
          <Accordion type='single' collapsible className='w-full'>
            {faqs.map((faq, index) => (
              <motion.div key={index} variants={itemVariants} className='group'>
                <AccordionItem
                  value={`item-${index}`}
                  className='bg-background border border-dhack-teal/30 rounded-lg mb-4 px-6 backdrop-blur-sm hover:border-dhack-orange/50 transition-colors duration-300'
                >
                  <AccordionTrigger className='w-full text-left py-6 text-foreground hover:text-dhack-teal hover:no-underline focus:no-underline transition-colors duration-200 [&[data-state=open]]:text-dhack-teal cursor-pointer'>
                    <span className='text-lg font-medium pr-4 block w-full'>
                      {faq.question}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className='pb-6 text-muted-foreground leading-relaxed cursor-default'>
                    <div className='pt-2 border-t border-dhack-teal/20'>
                      {faq.answer}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </motion.div>
      </div>

      {/* Background decorations */}
      <div className='absolute top-0 left-0 w-64 h-64 bg-dhack-orange/5 rounded-full blur-3xl pointer-events-none -z-10' />
      <div className='absolute bottom-0 right-0 w-64 h-64 bg-dhack-teal/5 rounded-full blur-3xl pointer-events-none -z-10' />
      <div className='absolute top-1/2 right-1/4 w-32 h-32 bg-dhack-accent/5 rounded-full blur-2xl pointer-events-none -z-10' />
    </section>
  );
};

export default FAQ;
