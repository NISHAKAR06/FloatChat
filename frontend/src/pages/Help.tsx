import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  HelpCircle,
  Search,
  MessageCircle,
  BookOpen,
  Play,
  FileText,
  ExternalLink
} from 'lucide-react';

const Help = () => {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = React.useState('');

  const faqItems = [
    {
      question: "What are ARGO floats?",
      answer: "ARGO floats are autonomous oceanographic instruments that drift with ocean currents and collect temperature, salinity, and pressure data. They dive to depths of up to 2000m and surface every 10 days to transmit data via satellite."
    },
    {
      question: "How do I search for specific data?",
      answer: "You can search for data using natural language queries in the chatbot, or use the advanced filters in the dashboard to specify regions, time ranges, and oceanographic parameters."
    },
    {
      question: "What data formats can I export?",
      answer: "We support multiple export formats including CSV, NetCDF, ASCII, and JSON. You can set your preferred default format in the Settings page."
    },
    {
      question: "How does the AI chatbot work?",
      answer: "Our AI chatbot uses advanced language models to understand your queries about oceanographic data and provides relevant insights and visualizations from the ARGO float dataset."
    },
    {
      question: "Can I use voice commands?",
      answer: "Yes! You can enable voice input in the Settings page. The chatbot supports both speech-to-text for input and text-to-speech for responses."
    },
    {
      question: "How often is the data updated?",
      answer: "ARGO float data is updated in near real-time as floats surface and transmit their data. Typically, new data is available within 24-48 hours of collection."
    },
    {
      question: "What is the difference between user and admin access?",
      answer: "Users can view, query, and export data. Admins have additional privileges to upload new data, manage users, configure AI models, and monitor system performance."
    }
  ];

  const filteredFAQ = faqItems.filter(item =>
    item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-surface">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <HelpCircle className="h-16 w-16 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">
            {t('navigation.help')} & Support
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Find answers to common questions and learn how to make the most of FloatChat
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Quick Help Cards */}
          <Card className="bg-glass backdrop-blur-sm border-glass hover:shadow-ocean transition-shadow">
            <CardContent className="p-6 text-center">
              <Play className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Getting Started
              </h3>
              <p className="text-muted-foreground mb-4">
                Learn the basics of using FloatChat
              </p>
              <Button variant="outline" className="w-full">
                Watch Tutorial
                <ExternalLink className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-glass backdrop-blur-sm border-glass hover:shadow-ocean transition-shadow">
            <CardContent className="p-6 text-center">
              <BookOpen className="h-12 w-12 text-accent mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                User Guide
              </h3>
              <p className="text-muted-foreground mb-4">
                Comprehensive documentation
              </p>
              <Button variant="outline" className="w-full">
                Read Docs
                <ExternalLink className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-glass backdrop-blur-sm border-glass hover:shadow-ocean transition-shadow">
            <CardContent className="p-6 text-center">
              <MessageCircle className="h-12 w-12 text-primary-glow mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Contact Support
              </h3>
              <p className="text-muted-foreground mb-4">
                Get help from our team
              </p>
              <Button variant="outline" className="w-full">
                Send Message
                <ExternalLink className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section */}
        <Card className="bg-glass backdrop-blur-sm border-glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-6 w-6 text-primary" />
              Frequently Asked Questions
            </CardTitle>
            <CardDescription>
              Find quick answers to common questions about FloatChat
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Search */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search FAQ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* FAQ Accordion */}
            <Accordion type="single" collapsible className="w-full">
              {filteredFAQ.map((item, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            {filteredFAQ.length === 0 && searchQuery && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  No FAQ items found matching "{searchQuery}"
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contact Section */}
        <div className="mt-12 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Still need help?
          </h2>
          <p className="text-muted-foreground mb-6">
            Our support team is ready to assist you with any questions or issues.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="default" size="lg">
              <MessageCircle className="h-5 w-5 mr-2" />
              Contact Support
            </Button>
            <Button variant="outline" size="lg">
              <BookOpen className="h-5 w-5 mr-2" />
              Documentation
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Help;