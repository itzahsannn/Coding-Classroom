import Card from '@/components/common/Card'
import Badge from '@/components/common/Badge'
import Button from '@/components/common/Button'
import { formatNumber } from '@/utils/helpers'

const features = [
  {
    icon: '⚡',
    title: 'Interactive Lessons',
    description: 'Hands-on coding exercises with real-time feedback in your browser.',
  },
  {
    icon: '🏆',
    title: 'Project-Based Learning',
    description: 'Build real projects from day one and add them to your portfolio.',
  },
  {
    icon: '🤖',
    title: 'AI-Powered Feedback',
    description: 'Get instant code reviews and suggestions powered by AI.',
  },
  {
    icon: '🌐',
    title: 'Community',
    description: 'Join thousands of learners, ask questions, and grow together.',
  },
  {
    icon: '📱',
    title: 'Learn Anywhere',
    description: 'Fully responsive — desktop, tablet, or mobile, your learning never stops.',
  },
  {
    icon: '🎓',
    title: 'Certificates',
    description: 'Earn verifiable certificates to showcase your skills to employers.',
  },
]

const courses = [
  {
    title: 'React & TypeScript Mastery',
    tags: ['TypeScript', 'React'],
    level: 'intermediate' as const,
    students: 12400,
    rating: 4.9,
    price: 49,
    color: 'from-brand-600 to-brand-400',
  },
  {
    title: 'Full-Stack with Node & MongoDB',
    tags: ['Node.js', 'MongoDB'],
    level: 'intermediate' as const,
    students: 8200,
    rating: 4.8,
    price: 'free' as const,
    color: 'from-accent-600 to-accent-400',
  },
  {
    title: 'Python for Data Science',
    tags: ['Python', 'Data Science'],
    level: 'beginner' as const,
    students: 21000,
    rating: 4.7,
    price: 39,
    color: 'from-violet-600 to-violet-400',
  },
]

const stats = [
  { label: 'Students Enrolled', value: 85000 },
  { label: 'Courses Available', value: 240 },
  { label: 'Expert Instructors', value: 48 },
  { label: 'Countries Reached', value: 120 },
]

const HomePage = () => {
  return (
    <div className="animate-fade-in">
      <section className="relative overflow-hidden py-24 px-4 sm:px-6 lg:px-8 text-center">
        <div className="absolute inset-0 pointer-events-none select-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-brand-600/10 blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-accent-500/8 blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto">
          <Badge color="brand" className="mb-5 animate-slide-up">
            🚀 New courses dropping every week
          </Badge>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-tight mb-6 animate-slide-up">
            Learn to{' '}
            <span className="gradient-text">Code</span>
            <br />
            Build, and Grow
          </h1>

          <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-10 animate-slide-up leading-relaxed">
            Master modern development skills with interactive lessons, expert mentors,
            and a community of passionate builders.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up">
            <Button variant="primary" size="lg">
              Start Learning Free →
            </Button>
            <Button variant="secondary" size="lg">
              Browse Courses
            </Button>
          </div>
        </div>
      </section>

      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <Card key={stat.label} className="text-center">
              <p className="text-3xl font-extrabold gradient-text mb-1">
                {formatNumber(stat.value)}+
              </p>
              <p className="text-sm text-gray-400">{stat.label}</p>
            </Card>
          ))}
        </div>
      </section>

      <section id="features" className="section">
        <div className="text-center mb-12">
          <Badge color="green" className="mb-3">Features</Badge>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Everything you need to succeed
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            From beginner to pro, we've built a platform that grows with you.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f) => (
            <Card key={f.title} hover>
              <div className="text-3xl mb-4">{f.icon}</div>
              <h3 className="font-semibold text-white mb-2">{f.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{f.description}</p>
            </Card>
          ))}
        </div>
      </section>

      <section id="courses" className="section">
        <div className="text-center mb-12">
          <Badge color="brand" className="mb-3">Courses</Badge>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Featured Courses
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            Hand-picked courses to jumpstart your developer journey.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Card key={course.title} hover className="flex flex-col gap-4">
              <div className={`h-36 rounded-xl bg-gradient-to-br ${course.color} opacity-80 flex items-center justify-center`}>
                <span className="text-white/60 font-mono text-sm">{'</>  '}{course.title.split(' ')[0]}</span>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {course.tags.map((tag) => (
                  <Badge key={tag} color="gray" className="text-xs">{tag}</Badge>
                ))}
                <Badge color={course.level === 'beginner' ? 'green' : 'brand'} className="text-xs capitalize">
                  {course.level}
                </Badge>
              </div>

              <h3 className="font-semibold text-white leading-snug">{course.title}</h3>

              <div className="flex items-center justify-between text-sm text-gray-400 mt-auto">
                <span>⭐ {course.rating} · {formatNumber(course.students)} students</span>
                <span className={course.price === 'free' ? 'text-accent-400 font-semibold' : 'text-white font-semibold'}>
                  {course.price === 'free' ? 'Free' : `$${course.price}`}
                </span>
              </div>

              <Button variant="secondary" className="w-full justify-center">
                View Course
              </Button>
            </Card>
          ))}
        </div>
      </section>

      <section className="section">
        <Card glow className="text-center py-14 bg-gradient-to-br from-brand-900/60 to-accent-900/30">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to start your <span className="gradient-text">journey?</span>
          </h2>
          <p className="text-gray-400 max-w-md mx-auto mb-8">
            Join over 85,000 students and take your first step towards becoming a professional developer.
          </p>
          <Button variant="primary" size="lg">
            Get Started for Free →
          </Button>
        </Card>
      </section>
    </div>
  )
}

export default HomePage
