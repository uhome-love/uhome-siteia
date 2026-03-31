import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface Props {
  faqs: Array<{ q: string; a: string }>;
}

export function HomeFaqSection({ faqs }: Props) {
  return (
    <section className="border-t border-border bg-background py-14 sm:py-20">
      <div className="mx-auto max-w-3xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <p className="font-body text-sm font-medium uppercase tracking-[0.15em] text-primary">
            Dúvidas frequentes
          </p>
          <h2 className="mt-2 text-h2 text-foreground text-balance">
            Perguntas sobre imóveis em Porto Alegre
          </h2>
        </motion.div>

        <Accordion type="multiple" className="mt-8 space-y-2">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
            >
              <AccordionItem
                value={`home-faq-${i}`}
                className="rounded-xl border border-border bg-card px-5 data-[state=open]:shadow-sm"
              >
                <AccordionTrigger className="py-4 text-left font-body text-[15px] font-medium text-foreground hover:no-underline [&[data-state=open]]:text-primary">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="pb-4 font-body text-sm leading-relaxed text-muted-foreground">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            </motion.div>
          ))}
        </Accordion>

        <div className="mt-6 text-center">
          <Link
            to="/faq"
            className="inline-flex items-center gap-1 font-body text-sm font-medium text-primary transition-colors hover:text-primary/80"
          >
            Ver todas as perguntas <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
