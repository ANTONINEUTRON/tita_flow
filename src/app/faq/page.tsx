'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AppConstants } from '@/lib/app_constants';

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
          Tita Flow is a decentralized and configurable funding platform built on Solana.
          It empowers fundraisers to raise support for their projects using flexible funding strategies,
          including milestone-based, full upfront, or partial disbursement models. Contributors remain in control
          via on-chain governance, and flows can be tailored to suit each project's needs.
        </p>
      ),
      category: "general"
    },
    {
      question: "How do I create a flow?",
      answer: (
        <div>
          <p>To create a flow:</p>
          <ol className="list-decimal pl-5 mt-2 space-y-1">
            <li>Connect your wallet</li>
            <li>Click on "Create Flow" in the navigation</li>
            <li>Fill out the project details, funding goal, media and timeline</li>
            <li>You have the option to define your milestones with specific deliverables and funding amounts</li>
            <li>Toggle on governance if you need it</li>
            <li>Submit and create your funding flow</li>
          </ol>
          <p className="mt-2">Your flow will be live immediately after creation.</p>
        </div>
      ),
      category: "fundraisers"
    },
    {
      question: "How do I contribute to a flow?",
      answer: (
        <div>
          <p>Contributing to a flow is simple:</p>
          <ol className="list-decimal pl-5 mt-2 space-y-1">
            <li>Open a specific flow</li>
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
      question: "How do funding rules work?",
      answer: (
        <div>
          <p>
            TITA Flow lets creators set customizable rules for how their funding works, giving both creators and contributors clarity and confidence:
          </p>
          <ol className="list-decimal pl-5 mt-2 space-y-1">
            <li>Project creators can define optional rules like milestones and governance parameters</li>
            <li>Milestone rules let creators break projects into stages with specific deliverables and funding amounts</li>
            <li>Governance rules determine whether contributors can vote on milestone completion or if creators self-verify</li>
            <li>All rules are transparent to contributors before they fund, building trust and accountability</li>
          </ol>
        </div>
      ),
      category: "funding"
    },
    {
      question: "How does milestone-based funding work?",
      answer: (
        <div>
          <p>
            TITA Flow offers optional milestone-based funding as a powerful tool for projects that need structured accountability. Here's how it works:
          </p>
          <ol className="list-decimal pl-5 mt-2 space-y-1">
            <li>Project creators can choose to define milestones with deliverables and funding amounts</li>
            <li>Contributors see exactly what to expect at each stage when milestones are used</li>
            <li>For projects needing additional accountability, funds can be released only when milestones are completed</li>
            <li>Voting on milestone completion is available but optional, giving fundraisers flexibility</li>
            <li>These optional tools help create transparency for projects where it's beneficial</li>
          </ol>
        </div>
      ),
      category: "funding"
    },
    {
      question: "What types of voting power models are available?",
      answer: (
        <div>
          <p>Tita Flow offers three voting power models:</p>
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
          Currently, Tita Flow supports selected tokens on the Solana blockchain. Flow creators can
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
          Tita Flow charges a small platform fee of 1.5% on funds released to creators.
          There may be a nominal flow creation fee to prevent spam in the future.
          All Solana network fees for transactions also apply.
        </p>
      ),
      category: "general"
    },
    {
      question: "How is Tita Flow different from other crowdfunding platforms?",
      answer: (
        <div>
          <p>Tita Flow differs from traditional platforms in several ways:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Fully on-chain, transparent funding with verifiable transactions</li>
            <li>Milestone-based release of funds that builds trust</li>
            <li>AI-powered assistance for creating and optimizing your funding flow</li>
            <li>Lower fees than traditional platforms</li>
            <li>Real-time notifications and updates for both creators and contributors</li>
          </ul>
        </div>
      ),
      category: "general"
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
    { id: 'fundraisers', name: 'For Fundraisers' },
    { id: 'contributors', name: 'For Contributors' },
    { id: 'governance', name: 'Governance' },
    { id: 'technical', name: 'Technical' }
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
            className={`px-4 py-2 rounded-full text-sm font-medium ${activeCategory === category.id
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
          <a href={"mailto:" + AppConstants.SUPPORT_EMAIL} className="text-blue-600 underline">
            {AppConstants.SUPPORT_EMAIL}
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