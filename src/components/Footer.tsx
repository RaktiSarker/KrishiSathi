import { Leaf, Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-foreground text-primary-foreground py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <Leaf className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-xl">
                কৃষি<span className="text-accent">সাথী</span>
              </span>
            </div>
            <p className="text-primary-foreground/70 mb-6 max-w-md">
              বাংলাদেশের টেকসই ও উৎপাদনশীল কৃষির জন্য বুদ্ধিমান সার ও
              কীটনাশক সুপারিশ দিয়ে কৃষকদের ক্ষমতায়ন করা।
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-primary-foreground/70">
                <MapPin className="w-4 h-4" />
                বরেন্দ্র বিশ্ববিদ্যালয়, রাজশাহী, বাংলাদেশ
              </div>
              <div className="flex items-center gap-2 text-sm text-primary-foreground/70">
                <Mail className="w-4 h-4" />
                contact@krishisathi.com
              </div>
              <div className="flex items-center gap-2 text-sm text-primary-foreground/70">
                <Phone className="w-4 h-4" />
                +৮৮০ ১XXX-XXXXXX
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">দ্রুত লিংক</h4>
            <ul className="space-y-2">
              {[
                { label: "হোম", href: "#home" },
                { label: "সুবিধাসমূহ", href: "#features" },
                { label: "সুপারিশ নিন", href: "#recommendation" },
                { label: "আমাদের সম্পর্কে", href: "#about" },
              ].map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-primary-foreground/70 hover:text-accent transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold mb-4">রিসোর্স</h4>
            <ul className="space-y-2">
              {["ফসল গাইড", "মাটি পরীক্ষা", "রোগবালাই প্রতিরোধ", "সাধারণ প্রশ্ন"].map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="text-sm text-primary-foreground/70 hover:text-accent transition-colors"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-primary-foreground/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-primary-foreground/60">
            © ২০২৫ কৃষিসাথী। বরেন্দ্র বিশ্ববিদ্যালয়ের CSE শিক্ষার্থীদের একটি প্রকল্প।
          </p>
          <p className="text-sm text-primary-foreground/60">
            বাংলাদেশের কৃষকদের জন্য 💚 ভালোবাসায় তৈরি
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
