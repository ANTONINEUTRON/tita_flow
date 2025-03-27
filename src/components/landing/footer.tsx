import Link from "next/link";
import { footerLinks, socialLinks } from "@/lib/data/landing-data";

export function Footer() {
  return (
    <footer className="w-full py-6 md:py-12 border-t border-gray-200 dark:border-gray-800 bg-background">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {footerLinks.map((column, index) => (
            <div key={index} className="space-y-4">
              <h4 className="text-lg font-semibold">{column.title}</h4>
              <ul className="space-y-2">
                {column.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link href={link.href} className="text-gray-500 hover:text-primary dark:text-gray-400">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center mt-8 pt-8 border-t border-gray-200 dark:border-gray-800">
          <p className="text-gray-500 dark:text-gray-400">© {new Date().getFullYear()} Tita. All rights reserved.</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            {socialLinks.map((social, index) => (
              <Link key={index} href={social.href} className="text-gray-500 hover:text-primary dark:text-gray-400">
                <span className="sr-only">{social.name}</span>
                <social.icon className="h-6 w-6" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}