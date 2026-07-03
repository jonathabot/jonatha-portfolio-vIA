import { getContent } from '@/lib/cms/fetch';
import { transform } from '@/lib/cms/transform';
import { IntlProvider } from '@/components/providers/IntlProvider';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Hero } from '@/components/sections/Hero';
import { Now } from '@/components/sections/Now';
import { Tools } from '@/components/sections/Tools';
import { Experience } from '@/components/sections/Experience';
import { Projects } from '@/components/sections/Projects';
import { Education } from '@/components/sections/Education';
import { Contact } from '@/components/sections/Contact';

export default async function Page() {
  const content = await getContent();
  const { messages, content: site } = transform(content);

  return (
    <IntlProvider messages={messages}>
      <div className="flex min-h-screen justify-center">
        <div className="box-border w-full max-w-[820px] px-8 pt-10">
          <Header />
          <Hero
            techs={site.hero.techs}
            links={site.hero.links}
            photoUrl={site.hero.photoUrl}
            showPhoto={site.flags.showPhoto}
          />
          <Now />
          <Tools />
          <Experience experience={site.experience} />
          <Projects projects={site.projects} />
          <Education show={site.flags.showEducation} />
          <Contact links={site.hero.links} />
          <Footer />
        </div>
      </div>
    </IntlProvider>
  );
}
