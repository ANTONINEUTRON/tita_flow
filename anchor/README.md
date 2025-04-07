┌──────────────────┐           ┌──────────────────┐
│                  │           │                  │
│   Flow Account   │◄─────────►│ Primary Vault    │ (Always exists)
│                  │           │                  │
└──────────────────┘           └──────────────────┘
         │                              ▲
         │                              │
         ▼                              │
┌──────────────────┐                    │
│   Flow Type      │                    │
│   Determined     │────────────────────┘
│   By Vault       │
│   Structure      │
└──────────────────┘
         │
         │
  ┌──────┴───────────────┐
  │                      │                      │
  ▼                      ▼                      ▼
┌─────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ Direct Flow │    │ Milestone Flow  │    │  Weighted Flow  │
│ (1 Vault)   │    │ (Multiple Vaults│    │ (Multiple Vaults│
│             │    │  with deadlines)│    │  with receivers)│
└─────────────┘    └─────────────────┘    └─────────────────┘



## Creating a Direct Flow
┌──────────┐     ┌───────────────┐     ┌─────────────┐
│          │     │               │     │             │
│  Client  │────►│  create_flow  │────►│  Flow PDA   │
│          │     │   (direct)    │     │             │
└──────────┘     └───────────────┘     └─────────────┘
                        │                     │
                        │                     │
                        ▼                     │
                 ┌─────────────┐              │
                 │             │              │
                 │Create Single│◄─────────────┘
                 │    Vault    │
                 │             │
                 └─────────────┘


## Creating a Milestone Flow
┌──────────┐     ┌───────────────┐     ┌─────────────┐
│          │     │               │     │             │
│  Client  │────►│  create_flow  │────►│  Flow PDA   │
│          │     │ (with milestone│     │             │
│          │     │   schedule)   │     │             │
└──────────┘     └───────────────┘     └─────────────┘
                        │                     │
                        │                     │
                        ▼                     │
                 ┌─────────────┐              │
                 │             │              │
                 │Create Primary│◄────────────┘
                 │    Vault    │
                 │             │
                 └─────────────┘
                        │
                        │
                        ▼
                 ┌─────────────────────────┐
                 │                         │
                 │Create Multiple Milestone│
                 │        Vaults          │
                 │                         │
                 └─────────────────────────┘


## Contributing to a Weighted Flow
Similar to Direct with multiple vaults and user specified

## Contributing to a Flow
┌──────────┐     ┌───────────────┐     ┌─────────────┐
│          │     │               │     │             │
│  Client  │────►│  contribute   │────►│ Determine   │
│          │     │               │     │ Flow Type   │
└──────────┘     └───────────────┘     └─────────────┘
                                             │
                                             │
                       ┌────────────────────┐│┌───────────────────┐
                       │                    ││                    │
                       ▼                    ▼▼                    ▼
                ┌────────────┐      ┌────────────┐       ┌────────────────┐
                │            │      │            │       │                │
                │Direct: Send│      │Milestone:  │       │Weighted: Split │
                │to Primary  │      │Based on    │       │to Multiple     │
                │Vault       │      │Schedule    │       │Vaults by Weight│
                │            │      │            │       │                │
                └────────────┘      └────────────┘       └────────────────┘
                       │                 │                       │
                       └─────────┬───────┴──────────────────────┘
                                 │
                                 ▼
                          ┌────────────┐
                          │            │
                          │Create      │
                          │Contribution│
                          │Record      │
                          │            │
                          └────────────┘
