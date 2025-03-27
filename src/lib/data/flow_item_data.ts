import { Flow, FlowType, FlowStatus, MilestoneStatus } from "../types/types";

export async function fetchFlowData(id: string): Promise<Flow> {
  // In a real app, this would be a fetch call to your API
  // For now, we return mock data
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const dummyFlow: Flow = {
    id,
    title: "Web3 Development Fund",
    description: "Supporting innovative blockchain projects and developers in the ecosystem",
    type: FlowType.RAISE,
    status: FlowStatus.ACTIVE,
    creator: {
      id: "user-1",
      name: "John Doe",
      avatarUrl: "/avatars/john-doe.jpg"
    },
    createdAt: "2023-10-15T14:30:00Z",
    startDate: "2024-01-01",
    endDate: "2024-12-31",
    currency: "USD",
    currencySymbol: "$",
    goal: 100000,
    raised: 65000,
    rules: {
      direct: true,
      milestone: true,
      weighted: false
    },
    // Add all your mock data fields here
    milestones: [
      {
        id: "ms-1",
        title: "Initial Research and Design",
        description: "Complete market research and architectural design documents.",
        amount: 10000,
        status: MilestoneStatus.VERIFIED,
        dueDate: "2024-02-01T00:00:00Z",
        proofLink: "https://example.com/proof"
      },
      {
        id: "ms-2",
        title: "Prototype Development",
        description: "Develop a working prototype with core functionality.",
        amount: 20000,
        status: MilestoneStatus.ACTIVE,
        dueDate: "2024-04-01T00:00:00Z"
      },
      {
        id: "ms-3",
        title: "Testing and Deployment",
        description: "Complete testing suite and deploy to mainnet.",
        amount: 15000,
        status: MilestoneStatus.PENDING,
        dueDate: "2024-06-01T00:00:00Z"
      }
    ],
    media: [
      {
        id: "media-1",
        type: "image",
        url: "https://images.unsplash.com/photo-1639762681057-408e52192e55?q=80&w=2832&auto=format&fit=crop",
        title: "Project Overview",
        description: "Visual representation of our roadmap and goals"
      },
      {
        id: "media-2",
        type: "video",
        url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        thumbnailUrl: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
        title: "Project Demo",
        description: "Watch how our solution works in action"
      },
      {
        id: "media-3",
        type: "image",
        url: "https://images.unsplash.com/photo-1639322537228-f710d846310a?q=80&w=2832&auto=format&fit=crop",
        title: "Team Photo",
        description: "Our passionate team building the future"
      }
    ],
    // Add other mock data like contributors, updates, proposals, etc.
  };
  
  return dummyFlow;
}