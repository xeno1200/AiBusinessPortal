import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Phone, Mic, MicOff, PhoneOff, Bot, User } from "lucide-react";

const AgentDemo = () => {
  const { t } = useTranslation();
  const [demoState, setDemoState] = useState<"idle" | "calling" | "conversation" | "ended">("idle");
  const [messageIndex, setMessageIndex] = useState(0);
  const [showTyping, setShowTyping] = useState(false);
  const [conversation, setConversation] = useState<{sender: "agent" | "user", text: string}[]>([]);
  
  // Define conversation scenarios based on the language
  const getScenarios = () => {
    return [
      { 
        sender: "agent" as const, 
        text: t("agentDemo.messages.greeting")
      },
      { 
        sender: "user" as const, 
        text: t("agentDemo.messages.userQuestion1") 
      },
      { 
        sender: "agent" as const, 
        text: t("agentDemo.messages.agentResponse1") 
      },
      { 
        sender: "user" as const, 
        text: t("agentDemo.messages.userQuestion2") 
      },
      { 
        sender: "agent" as const, 
        text: t("agentDemo.messages.agentResponse2") 
      },
      { 
        sender: "user" as const, 
        text: t("agentDemo.messages.userConfirmation") 
      },
      { 
        sender: "agent" as const, 
        text: t("agentDemo.messages.agentConfirmation") 
      }
    ];
  };

  const demoMessages = getScenarios();

  const startDemo = () => {
    setDemoState("calling");
    setConversation([]);
    setMessageIndex(0);
    
    // Simulate phone pickup
    setTimeout(() => {
      setDemoState("conversation");
      addNextMessage();
    }, 2000);
  };

  const endDemo = () => {
    setDemoState("ended");
    
    // Reset after a delay
    setTimeout(() => {
      setDemoState("idle");
      setConversation([]);
      setMessageIndex(0);
    }, 3000);
  };

  const addNextMessage = () => {
    if (messageIndex < demoMessages.length) {
      const currentMessage = demoMessages[messageIndex];
      
      // Show typing indicator for agent messages
      if (currentMessage.sender === "agent") {
        setShowTyping(true);
        
        // Simulate typing
        setTimeout(() => {
          setShowTyping(false);
          setConversation(prev => [...prev, currentMessage as { sender: "agent" | "user"; text: string }]);
          setMessageIndex(prev => prev + 1);
          
          // Add delay before next message
          if (messageIndex + 1 < demoMessages.length) {
            setTimeout(addNextMessage, 1500);
          } else {
            // End conversation
            setTimeout(endDemo, 2000);
          }
        }, 1500);
      } else {
        // User messages appear immediately
        setConversation(prev => [...prev, currentMessage as { sender: "agent" | "user"; text: string }]);
        setMessageIndex(prev => prev + 1);
        
        // Add delay before next message
        setTimeout(addNextMessage, 1000);
      }
    }
  };

  // When language changes, reset demo and update messages
  const { i18n } = useTranslation();
  useEffect(() => {
    if (demoState !== "idle") {
      setDemoState("idle");
      setConversation([]);
      setMessageIndex(0);
    }
  }, [i18n.language]);

  return (
    <section id="demo" className="py-16 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <motion.h2 
            className="font-heading text-3xl md:text-4xl font-bold text-gray-900 mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            {t("agentDemo.title")}
          </motion.h2>
          
          <motion.p 
            className="text-xl text-gray-600 max-w-3xl mx-auto mb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {t("agentDemo.subtitle")}
          </motion.p>
        </div>
        
        <motion.div 
          className="max-w-md mx-auto bg-white rounded-xl shadow-xl overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {/* Phone screen */}
          <div className="bg-gray-800 p-4 text-white">
            <div className="flex justify-between items-center">
              <div className="text-sm">{t("agentDemo.phoneUI.network")}</div>
              <div className="text-sm">{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
            </div>
          </div>
          
          {/* Conversation area */}
          <div className="h-96 bg-gray-100 p-4 overflow-y-auto flex flex-col">
            {demoState === "idle" && (
              <div className="flex-grow flex flex-col items-center justify-center">
                <Bot size={48} className="text-primary-600 mb-4" />
                <p className="text-center text-gray-500">
                  {t("agentDemo.phoneUI.idleMessage")}
                </p>
                <Button 
                  onClick={startDemo} 
                  className="mt-6 bg-green-500 hover:bg-green-600"
                >
                  <Phone className="mr-2 h-4 w-4" />
                  {t("agentDemo.phoneUI.startCall")}
                </Button>
              </div>
            )}
            
            {demoState === "calling" && (
              <div className="flex-grow flex flex-col items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center mb-4">
                  <Bot size={36} className="text-primary-600 animate-pulse" />
                </div>
                <p className="text-lg font-medium mb-2">{t("agentDemo.phoneUI.botName")}</p>
                <p className="text-gray-500 mb-6">{t("agentDemo.phoneUI.calling")}</p>
                <div className="flex space-x-4">
                  <Button variant="outline" className="rounded-full bg-red-100 hover:bg-red-200 border-none" onClick={endDemo}>
                    <PhoneOff className="h-6 w-6 text-red-500" />
                  </Button>
                  <Button variant="outline" className="rounded-full bg-green-100 hover:bg-green-200 border-none">
                    <Mic className="h-6 w-6 text-green-500" />
                  </Button>
                </div>
              </div>
            )}
            
            {demoState === "conversation" && (
              <>
                {conversation.map((message, index) => (
                  <div 
                    key={index} 
                    className={`mb-4 flex ${message.sender === 'agent' ? 'justify-start' : 'justify-end'}`}
                  >
                    <div 
                      className={`max-w-[80%] p-3 rounded-lg ${
                        message.sender === 'agent' 
                          ? 'bg-white text-gray-800 rounded-tl-none shadow' 
                          : 'bg-primary-600 text-white rounded-tr-none'
                      }`}
                    >
                      <div className="flex items-center mb-1">
                        {message.sender === 'agent' ? (
                          <>
                            <Bot size={16} className="mr-1" />
                            <span className="text-xs font-semibold">
                              {t("agentDemo.phoneUI.botName")}
                            </span>
                          </>
                        ) : (
                          <>
                            <User size={16} className="mr-1" />
                            <span className="text-xs font-semibold">
                              {t("agentDemo.phoneUI.you")}
                            </span>
                          </>
                        )}
                      </div>
                      <p>{message.text}</p>
                    </div>
                  </div>
                ))}
                
                {showTyping && (
                  <div className="mb-4 flex justify-start">
                    <div className="bg-white p-3 rounded-lg rounded-tl-none max-w-[80%] shadow">
                      <div className="flex items-center">
                        <Bot size={16} className="mr-1" />
                        <span className="text-xs font-semibold">
                          {t("agentDemo.phoneUI.botName")}
                        </span>
                      </div>
                      <div className="flex py-1">
                        <div className="h-2 w-2 bg-gray-400 rounded-full mx-[1px] animate-bounce"></div>
                        <div className="h-2 w-2 bg-gray-400 rounded-full mx-[1px] animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                        <div className="h-2 w-2 bg-gray-400 rounded-full mx-[1px] animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="mt-auto">
                  <Button 
                    variant="outline" 
                    className="rounded-full bg-red-100 hover:bg-red-200 border-none" 
                    onClick={endDemo}
                  >
                    <PhoneOff className="h-5 w-5 text-red-500" />
                  </Button>
                </div>
              </>
            )}
            
            {demoState === "ended" && (
              <div className="flex-grow flex flex-col items-center justify-center">
                <PhoneOff size={48} className="text-gray-400 mb-4" />
                <p className="text-center text-gray-500">
                  {t("agentDemo.phoneUI.callEnded")}
                </p>
              </div>
            )}
          </div>
          
          {/* Phone buttons */}
          <div className="bg-gray-200 p-4 flex justify-center">
            <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center">
              <div className="w-4 h-4 rounded-full"></div>
            </div>
          </div>
        </motion.div>
        
        <div className="text-center mt-10">
          <Button onClick={startDemo} disabled={demoState !== 'idle'}>
            {t("agentDemo.tryDemo")}
          </Button>
        </div>
      </div>
      
      {/* We'll use inline styles instead */}
    </section>
  );
};

export default AgentDemo;