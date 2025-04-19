/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/tita_flow.json`.
 */
export type TitaFlow = {
  "address": "4qgU6nZVrBQdYoaKHNBZju32cX3QqKhhDx23m3VCCuHp",
  "metadata": {
    "name": "titaFlow",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "contribute",
      "discriminator": [
        82,
        33,
        68,
        131,
        32,
        0,
        205,
        95
      ],
      "accounts": [
        {
          "name": "contributor",
          "writable": true,
          "signer": true
        },
        {
          "name": "flow",
          "writable": true
        },
        {
          "name": "contribution",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  105,
                  116,
                  97,
                  45,
                  99,
                  111,
                  110,
                  116,
                  114,
                  105,
                  98,
                  117,
                  116,
                  105,
                  111,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "flow"
              },
              {
                "kind": "account",
                "path": "contributor"
              }
            ]
          }
        },
        {
          "name": "contributorTokenAccount",
          "writable": true
        },
        {
          "name": "flowTokenAccount",
          "writable": true
        },
        {
          "name": "tokenMint"
        },
        {
          "name": "tokenProgram"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "createFlow",
      "discriminator": [
        139,
        104,
        255,
        32,
        61,
        236,
        41,
        31
      ],
      "accounts": [
        {
          "name": "creator",
          "writable": true,
          "signer": true
        },
        {
          "name": "flow",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  105,
                  116,
                  97,
                  45,
                  102,
                  108,
                  111,
                  119
                ]
              },
              {
                "kind": "arg",
                "path": "flowId"
              },
              {
                "kind": "account",
                "path": "creator"
              }
            ]
          }
        },
        {
          "name": "flowTokenAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  105,
                  116,
                  97,
                  45,
                  102,
                  108,
                  111,
                  119,
                  45,
                  116,
                  97
                ]
              },
              {
                "kind": "account",
                "path": "flow"
              },
              {
                "kind": "account",
                "path": "tokenMint"
              }
            ]
          }
        },
        {
          "name": "tokenMint"
        },
        {
          "name": "tokenProgram"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "flowId",
          "type": "string"
        },
        {
          "name": "goal",
          "type": "u64"
        },
        {
          "name": "startTime",
          "type": {
            "option": "i64"
          }
        },
        {
          "name": "endTime",
          "type": {
            "option": "i64"
          }
        },
        {
          "name": "milestones",
          "type": {
            "option": {
              "vec": {
                "defined": {
                  "name": "milestone"
                }
              }
            }
          }
        }
      ]
    },
    {
      "name": "createProposal",
      "discriminator": [
        132,
        116,
        68,
        174,
        216,
        160,
        198,
        22
      ],
      "accounts": [
        {
          "name": "proposer",
          "writable": true,
          "signer": true
        },
        {
          "name": "flow",
          "writable": true
        },
        {
          "name": "proposal",
          "writable": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "proposalType",
          "type": {
            "defined": {
              "name": "proposalType"
            }
          }
        },
        {
          "name": "votingDuration",
          "type": "i64"
        },
        {
          "name": "quorumPercentage",
          "type": "u16"
        },
        {
          "name": "approvalPercentage",
          "type": "u16"
        }
      ]
    },
    {
      "name": "vote",
      "discriminator": [
        227,
        110,
        155,
        23,
        136,
        126,
        172,
        25
      ],
      "accounts": [
        {
          "name": "voter",
          "writable": true,
          "signer": true
        },
        {
          "name": "proposal",
          "writable": true
        },
        {
          "name": "flow",
          "writable": true
        },
        {
          "name": "contribution"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "voteType",
          "type": {
            "defined": {
              "name": "voteType"
            }
          }
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "contribution",
      "discriminator": [
        182,
        187,
        14,
        111,
        72,
        167,
        242,
        212
      ]
    },
    {
      "name": "flow",
      "discriminator": [
        126,
        151,
        86,
        177,
        58,
        153,
        167,
        203
      ]
    },
    {
      "name": "proposal",
      "discriminator": [
        26,
        94,
        189,
        187,
        116,
        136,
        53,
        33
      ]
    }
  ],
  "events": [
    {
      "name": "contributionEvent",
      "discriminator": [
        66,
        160,
        5,
        247,
        2,
        131,
        249,
        150
      ]
    },
    {
      "name": "flowCreatedEvent",
      "discriminator": [
        97,
        126,
        21,
        187,
        40,
        199,
        96,
        104
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "invalidMilestoneAmount",
      "msg": "Invalid Milestone Amount"
    },
    {
      "code": 6001,
      "name": "emptyFlowId",
      "msg": "Empty Flow ID"
    },
    {
      "code": 6002,
      "name": "flowIdTooLong",
      "msg": "Flow ID too long"
    },
    {
      "code": 6003,
      "name": "invalidGoalAmount",
      "msg": "Invalid Goal Amount"
    },
    {
      "code": 6004,
      "name": "invalidStartTime",
      "msg": "Invalid start time"
    },
    {
      "code": 6005,
      "name": "invalidTimeframe",
      "msg": "Invalid timeframe"
    },
    {
      "code": 6006,
      "name": "tooManyMilestones",
      "msg": "Too many milestones"
    },
    {
      "code": 6007,
      "name": "noMilestonesSpecified",
      "msg": "No milestones specified"
    },
    {
      "code": 6008,
      "name": "invalidMilestoneDeadline",
      "msg": "Invalid milestone deadline"
    },
    {
      "code": 6009,
      "name": "milestoneAfterEndTime",
      "msg": "Milestone deadline is after end time"
    },
    {
      "code": 6010,
      "name": "mathOverflow",
      "msg": "mathOverflow"
    },
    {
      "code": 6011,
      "name": "milestoneTotalMismatch",
      "msg": "Milestone total mismatch"
    },
    {
      "code": 6012,
      "name": "invalidContributionAmount",
      "msg": "Invalid Contribution Amount"
    },
    {
      "code": 6013,
      "name": "flowNotActive",
      "msg": "Flow not active"
    },
    {
      "code": 6014,
      "name": "invalidTokenMint",
      "msg": "Invalid token mint"
    },
    {
      "code": 6015,
      "name": "invalidTokenAccount",
      "msg": "Invalid token owner"
    },
    {
      "code": 6016,
      "name": "invalidTokenOwner",
      "msg": "Invalid token owner"
    },
    {
      "code": 6017,
      "name": "flowEnded",
      "msg": "Flow ended"
    },
    {
      "code": 6018,
      "name": "flowNotStarted",
      "msg": "Flow not started"
    },
    {
      "code": 6019,
      "name": "votingNotActive",
      "msg": "Proposal is not in active voting state"
    },
    {
      "code": 6020,
      "name": "proposalAlreadyExecuted",
      "msg": "Proposal has already been executed"
    },
    {
      "code": 6021,
      "name": "unauthorizedCancellation",
      "msg": "Unauthorized cancellation"
    },
    {
      "code": 6022,
      "name": "activeProposalExists",
      "msg": "This flow already has an active proposal"
    },
    {
      "code": 6023,
      "name": "proposalNotActive",
      "msg": "This proposal is not currently active for voting"
    },
    {
      "code": 6024,
      "name": "invalidFlow",
      "msg": "The provided flow doesn't match the proposal's flow"
    },
    {
      "code": 6025,
      "name": "invalidProposal",
      "msg": "This is not the active proposal for this flow"
    },
    {
      "code": 6026,
      "name": "invalidContribution",
      "msg": "The provided contribution doesn't belong to this flow"
    },
    {
      "code": 6027,
      "name": "unauthorizedVoter",
      "msg": "You are not authorized to vote with this contribution account"
    },
    {
      "code": 6028,
      "name": "votingNotStarted",
      "msg": "The voting period has not started yet"
    },
    {
      "code": 6029,
      "name": "votingEnded",
      "msg": "The voting period has already ended"
    },
    {
      "code": 6030,
      "name": "zeroVotingPower",
      "msg": "You cannot vote with zero voting power"
    },
    {
      "code": 6031,
      "name": "alreadyVoted",
      "msg": "You have already voted on this proposal"
    },
    {
      "code": 6032,
      "name": "notMilestoneFlow",
      "msg": "This flow doesn't have any milestones to complete"
    },
    {
      "code": 6033,
      "name": "milestoneNotFound",
      "msg": "The specified milestone wasn't found in this flow"
    },
    {
      "code": 6034,
      "name": "milestoneAlreadyCompleted",
      "msg": "This milestone has already been completed"
    },
    {
      "code": 6035,
      "name": "cannotCancelFlow",
      "msg": "The flow cannot be cancelled in its current state"
    },
    {
      "code": 6036,
      "name": "invalidMilestoneAdjustment",
      "msg": "The proposed milestone adjustments would exceed the flow's goal"
    },
    {
      "code": 6037,
      "name": "invalidFlowExtension",
      "msg": "The proposed flow extension date must be after the current end date"
    }
  ],
  "types": [
    {
      "name": "contribution",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "flow",
            "type": "pubkey"
          },
          {
            "name": "contributor",
            "type": "pubkey"
          },
          {
            "name": "totalAmount",
            "type": "u64"
          },
          {
            "name": "firstContribution",
            "type": "i64"
          },
          {
            "name": "lastContribution",
            "type": "i64"
          },
          {
            "name": "contributionCount",
            "type": "u32"
          },
          {
            "name": "tokenMint",
            "type": "pubkey"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "contributionEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "flow",
            "type": "pubkey"
          },
          {
            "name": "contributor",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "totalContributed",
            "type": "u64"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "flow",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "flowId",
            "type": "string"
          },
          {
            "name": "creator",
            "type": "pubkey"
          },
          {
            "name": "tokenMint",
            "type": "pubkey"
          },
          {
            "name": "goal",
            "type": "u64"
          },
          {
            "name": "raised",
            "type": "u64"
          },
          {
            "name": "startDate",
            "type": {
              "option": "i64"
            }
          },
          {
            "name": "endDate",
            "type": {
              "option": "i64"
            }
          },
          {
            "name": "flowStatus",
            "type": {
              "defined": {
                "name": "flowStatus"
              }
            }
          },
          {
            "name": "contributorCount",
            "type": "u32"
          },
          {
            "name": "milestones",
            "type": {
              "option": {
                "vec": {
                  "defined": {
                    "name": "milestone"
                  }
                }
              }
            }
          },
          {
            "name": "proposalCount",
            "type": "u8"
          },
          {
            "name": "votingPowerModel",
            "type": {
              "defined": {
                "name": "votingPowerModel"
              }
            }
          },
          {
            "name": "activeProposal",
            "type": {
              "option": "pubkey"
            }
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "flowCreatedEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "flowId",
            "type": "string"
          },
          {
            "name": "creator",
            "type": "pubkey"
          },
          {
            "name": "isMilestone",
            "type": "bool"
          },
          {
            "name": "goal",
            "type": "u64"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "flowStatus",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "active"
          },
          {
            "name": "completed"
          },
          {
            "name": "canceled"
          }
        ]
      }
    },
    {
      "name": "milestone",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "id",
            "type": "u32"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "deadline",
            "type": "i64"
          },
          {
            "name": "completed",
            "type": "bool"
          },
          {
            "name": "withdrawn",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "proposal",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "flow",
            "type": "pubkey"
          },
          {
            "name": "proposer",
            "type": "pubkey"
          },
          {
            "name": "proposalType",
            "type": {
              "defined": {
                "name": "proposalType"
              }
            }
          },
          {
            "name": "status",
            "type": {
              "defined": {
                "name": "proposalStatus"
              }
            }
          },
          {
            "name": "createdAt",
            "type": "i64"
          },
          {
            "name": "votingStartsAt",
            "type": "i64"
          },
          {
            "name": "votingEndsAt",
            "type": "i64"
          },
          {
            "name": "votesFor",
            "type": "u64"
          },
          {
            "name": "votesAgainst",
            "type": "u64"
          },
          {
            "name": "votesAbstain",
            "type": "u64"
          },
          {
            "name": "totalEligibleVotes",
            "type": "u64"
          },
          {
            "name": "executedAt",
            "type": {
              "option": "i64"
            }
          },
          {
            "name": "quorumPercentage",
            "type": "u16"
          },
          {
            "name": "approvalPercentage",
            "type": "u16"
          },
          {
            "name": "lastVoteCheck",
            "type": "i64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "proposalStatus",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "active"
          },
          {
            "name": "passed"
          },
          {
            "name": "failed"
          },
          {
            "name": "executed"
          },
          {
            "name": "canceled"
          }
        ]
      }
    },
    {
      "name": "proposalType",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "milestoneCompletion",
            "fields": [
              {
                "name": "milestoneId",
                "type": "u32"
              }
            ]
          },
          {
            "name": "flowCancellation"
          },
          {
            "name": "milestoneAdjustment",
            "fields": [
              {
                "name": "milestoneId",
                "type": "u32"
              },
              {
                "name": "newAmount",
                "type": {
                  "option": "u64"
                }
              },
              {
                "name": "newDeadline",
                "type": {
                  "option": "i64"
                }
              }
            ]
          },
          {
            "name": "flowFundingExtension",
            "fields": [
              {
                "name": "newEndDate",
                "type": "i64"
              }
            ]
          }
        ]
      }
    },
    {
      "name": "voteType",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "for"
          },
          {
            "name": "against"
          },
          {
            "name": "abstain"
          }
        ]
      }
    },
    {
      "name": "votingPowerModel",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "tokenWeighted"
          },
          {
            "name": "quadraticVoting"
          },
          {
            "name": "individualVoting"
          }
        ]
      }
    }
  ]
};
