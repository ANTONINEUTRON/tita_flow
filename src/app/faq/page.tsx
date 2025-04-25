'use client';

import { useState } from 'react';
import Link from 'next/link';

interface FAQItem {
  question: string;
  answer: React.ReactNode;
  category: string;
}

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  
  const faqItems: FAQItem[] = [
    {
      question: "What is TITA Flow?",
      answer: (
        <p>
          TITA Flow is a decentralized funding platform built on Solana that allows creators to raise funds 
          for their projects through milestone-based funding. Funds are released as milestones are completed 
          and approved by contributors through on-chain governance.
        </p>
      ),
      category: "general"
    },
    {
      question: "How does milestone-based funding work?",
      answer: (
        <div>
          <p>
            Milestone-based funding divides a project into specific deliverable phases. Here's how it works:
          </p>
          <ol className="list-decimal pl-5 mt-2 space-y-1">
            <li>Project creators define clear milestones with deliverables and funding amounts</li>
            <li>Contributors fund the project knowing exactly what to expect at each stage</li>
            <li>Funds are released only when milestones are completed and approved by voting</li>
            <li>This creates accountability and reduces risk for contributors</li>
          </ol>
        </div>
      ),
      category: "funding"
    },
    {
      question: "What types of voting power models are available?",
      answer: (
        <div>
          <p>TITA Flow offers three voting power models:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li><strong>Token-Weighted</strong>: 1 token = 1 vote (traditional model)</li>
            <li><strong>Quadratic Voting</strong>: Voting power equals the square root of contribution (reduces whale influence)</li>
            <li><strong>Individual Voting</strong>: Each contributor gets 1 vote regardless of contribution size (democratic model)</li>
          </ul>
          <p className="mt-2">The voting model is selected by the flow creator when setting up the project.</p>
        </div>
      ),
      category: "governance"
    },
    {
      question: "How do I create a flow?",
      answer: (
        <div>
          <p>To create a flow:</p>
          <ol className="list-decimal pl-5 mt-2 space-y-1">
            <li>Connect your wallet</li>
            <li>Click on "Create Flow" in the navigation</li>
            <li>Fill out the project details, funding goal, and timeline</li>
            <li>Define your milestones with specific deliverables and funding amounts</li>
            <li>Choose your preferred voting power model</li>
            <li>Set governance parameters (quorum, approval threshold)</li>
            <li>Submit and pay a small creation fee</li>
          </ol>
          <p className="mt-2">Your flow will be live immediately after creation.</p>
        </div>
      ),
      category: "creators"
    },
    {
      question: "How do I contribute to a flow?",
      answer: (
        <div>
          <p>Contributing to a flow is simple:</p>
          <ol className="list-decimal pl-5 mt-2 space-y-1">
            <li>Connect your wallet</li>
            <li>Browse available flows or go directly to a specific flow</li>
            <li>Review the project details and milestones</li>
            <li>Click "Contribute" and enter the amount you wish to fund</li>
            <li>Approve the transaction in your wallet</li>
          </ol>
          <p className="mt-2">
            Once you contribute, you'll become a stakeholder in the project with voting rights based on the
            flow's governance model.
          </p>
        </div>
      ),
      category: "contributors"
    },
    {
      question: "How do milestone approvals work?",
      answer: (
        <p>
          When a creator completes a milestone, they submit it for approval. A proposal is created,
          and all contributors can vote using their voting power (determined by the flow's voting model).
          If the proposal reaches both the quorum requirement and approval threshold, the milestone is
          approved and funds for that milestone are released to the creator.
        </p>
      ),
      category: "governance"
    },
    {
      question: "What happens if a flow is cancelled?",
      answer: (
        <p>
          If a flow is cancelled through a governance vote, all remaining funds (excluding those already
          released for completed milestones) become available for contributors to withdraw. Each contributor
          can claim their proportional share of the remaining funds based on their contribution amount.
        </p>
      ),
      category: "funding"
    },
    {
      question: "What tokens are supported?",
      answer: (
        <p>
          Currently, TITA Flow supports SOL and SPL tokens on the Solana blockchain. Flow creators can 
          specify which token they want to accept for their project. Support for more tokens will be
          added in future updates.
        </p>
      ),
      category: "funding"
    },
    {
      question: "Are there any fees?",
      answer: (
        <p>
          TITA Flow charges a small platform fee of 2% on funds released to creators. There is also
          a nominal flow creation fee to prevent spam. All Solana network fees for transactions also apply.
        </p>
      ),
      category: "general"
    },
    {
      question: "How is TITA Flow different from other crowdfunding platforms?",
      answer: (
        <div>
          <p>TITA Flow differs from traditional platforms in several ways:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Fully on-chain, transparent funding and governance</li>
            <li>Milestone-based release of funds with contributor approval</li>
            <li>Multiple voting models for flexible governance</li>
            <li>Lower fees than traditional platforms</li>
            <li>No centralized authority - contributors control fund release</li>
          </ul>
        </div>
      ),
      category: "general"
    },
    {
      question: "How secure is TITA Flow?",
      answer: (
        <div>
          <p>
            TITA Flow is built with security as a priority:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Smart contracts are audited by security professionals</li>
            <li>All funds are stored in secure on-chain treasuries</li>
            <li>Governance mechanisms prevent unauthorized access to funds</li>
            <li>Open-source code allows community review</li>
          </ul>
          <p className="mt-2">
            However, as with any blockchain application, users should exercise caution and do their
            own research before contributing to projects.
          </p>
        </div>
      ),
      category: "security"
    },
    {
      question: "I'm having wallet connection issues. How can I fix this?",
      answer: (
        <div>
          <p>If you're experiencing wallet connection issues:</p>
          <ol className="list-decimal pl-5 mt-2 space-y-1">
            <li>Ensure your wallet (Phantom, Solflare, etc.) is installed and updated</li>
            <li>Try refreshing the page</li>
            <li>Clear your browser cache</li>
            <li>Disconnect and reconnect your wallet</li>
            <li>Try using a different supported wallet</li>
          </ol>
          <p className="mt-2">
            If problems persist, please contact our support team via the{" "}
            <Link href="/support" className="text-blue-600 underline">support page</Link>.
          </p>
        </div>
      ),
      category: "technical"
    }
  ];
  
  const categories = [
    { id: 'all', name: 'All Questions' },
    { id: 'general', name: 'General' },
    { id: 'funding', name: 'Funding' },
    { id: 'governance', name: 'Governance' },
    { id: 'creators', name: 'For Creators' },
    { id: 'contributors', name: 'For Contributors' },
    { id: 'technical', name: 'Technical' },
    { id: 'security', name: 'Security' }
  ];
  
  const filteredFAQs = activeCategory === 'all' 
    ? faqItems 
    : faqItems.filter(item => item.category === activeCategory);
  
  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <h1 className="text-4xl font-bold text-center mb-8">Frequently Asked Questions</h1>
      
      <div className="mb-8 flex flex-wrap gap-2 justify-center">
        {categories.map(category => (
          <button
            key={category.id}
            onClick={() => setActiveCategory(category.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium ${
              activeCategory === category.id 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>
      
      <div className="space-y-6">
        {filteredFAQs.map((faq, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-3">{faq.question}</h3>
            <div className="text-gray-600">{faq.answer}</div>
            <div className="mt-4">
              <span className="inline-block px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                {categories.find(cat => cat.id === faq.category)?.name || faq.category}
              </span>
            </div>
          </div>
        ))}
        
        {filteredFAQs.length === 0 && (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600">No FAQs found in this category.</p>
          </div>
        )}
      </div>
      
      <div className="mt-12 text-center">
        <p className="text-gray-600">
          Still have questions? Contact us at{' '}
          <a href="mailto:support@titaflow.xyz" className="text-blue-600 underline">
            support@titaflow.xyz
          </a>
        </p>
        
        <div className="mt-6">
          <Link href="/" className="text-blue-600 hover:underline">
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}