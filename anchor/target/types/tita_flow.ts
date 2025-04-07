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
      "name": "createDirectFlow",
      "discriminator": [
        231,
        143,
        245,
        122,
        39,
        63,
        134,
        128
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
          "name": "vault",
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
                  118,
                  97,
                  117,
                  108,
                  116
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
        }
      ]
    }
  ],
  "accounts": [
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
      "name": "vault",
      "discriminator": [
        211,
        8,
        232,
        43,
        2,
        152,
        117,
        119
      ]
    }
  ],
  "events": [
    {
      "name": "tita_flow::instructions::create_direct_flow::FlowCreatedEvent",
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
    },
    {
      "name": "tita_flow::instructions::create_milestone_flow::FlowCreatedEvent",
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
    },
    {
      "name": "tita_flow::instructions::create_weighted_flow::FlowCreatedEvent",
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
      "name": "emptyFlowId",
      "msg": "Flow ID cannot be empty"
    },
    {
      "code": 6001,
      "name": "flowIdTooLong",
      "msg": "Flow ID exceeds maximum length"
    },
    {
      "code": 6002,
      "name": "invalidGoalAmount",
      "msg": "Invalid goal amount"
    },
    {
      "code": 6003,
      "name": "invalidStartTime",
      "msg": "Invalid start time"
    },
    {
      "code": 6004,
      "name": "invalidTimeframe",
      "msg": "Invalid end time or timeframe"
    },
    {
      "code": 6005,
      "name": "flowEnded",
      "msg": "Flow has ended"
    },
    {
      "code": 6006,
      "name": "inactiveFlow",
      "msg": "Flow is inactive"
    },
    {
      "code": 6007,
      "name": "noMilestonesSpecified",
      "msg": "No milestones specified"
    },
    {
      "code": 6008,
      "name": "tooManyMilestones",
      "msg": "Too many milestones specified (max 10)"
    },
    {
      "code": 6009,
      "name": "emptyMilestoneDescription",
      "msg": "Empty milestone description"
    },
    {
      "code": 6010,
      "name": "milestoneDescriptionTooLong",
      "msg": "Milestone description too long"
    },
    {
      "code": 6011,
      "name": "invalidMilestoneDeadline",
      "msg": "Invalid milestone deadline"
    },
    {
      "code": 6012,
      "name": "invalidMilestoneWeight",
      "msg": "Invalid milestone weight"
    },
    {
      "code": 6013,
      "name": "milestoneWeightsIncorrect",
      "msg": "Milestone weights do not add up to 100% (10000 basis points)"
    },
    {
      "code": 6014,
      "name": "milestoneAccountsMismatch",
      "msg": "Number of milestone accounts does not match milestone configurations"
    },
    {
      "code": 6015,
      "name": "noAllocationsSpecified",
      "msg": "No allocations specified"
    },
    {
      "code": 6016,
      "name": "tooManyAllocations",
      "msg": "Too many allocations specified (max 10)"
    },
    {
      "code": 6017,
      "name": "emptyAllocationDescription",
      "msg": "Empty allocation description"
    },
    {
      "code": 6018,
      "name": "allocationDescriptionTooLong",
      "msg": "Allocation description too long"
    },
    {
      "code": 6019,
      "name": "invalidAllocationWeight",
      "msg": "Invalid allocation weight"
    },
    {
      "code": 6020,
      "name": "allocationWeightsIncorrect",
      "msg": "Allocation weights do not add up to 100% (10000 basis points)"
    },
    {
      "code": 6021,
      "name": "allocationAccountsMismatch",
      "msg": "Number of allocation accounts does not match allocation configurations"
    },
    {
      "code": 6022,
      "name": "invalidVaultAddress",
      "msg": "Invalid vault address"
    },
    {
      "code": 6023,
      "name": "mathOverflow",
      "msg": "Math overflow"
    }
  ],
  "types": [
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
            "name": "primaryVault",
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
      "name": "vault",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "flow",
            "type": "pubkey"
          },
          {
            "name": "tokenMint",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "vaultType",
            "type": {
              "defined": {
                "name": "vaultType"
              }
            }
          },
          {
            "name": "milestoneDeadline",
            "type": {
              "option": "i64"
            }
          },
          {
            "name": "milestoneCompleted",
            "type": {
              "option": "bool"
            }
          },
          {
            "name": "recipient",
            "type": {
              "option": "pubkey"
            }
          },
          {
            "name": "weight",
            "type": {
              "option": "u32"
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
      "name": "vaultType",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "direct"
          },
          {
            "name": "milestone"
          },
          {
            "name": "weighted"
          }
        ]
      }
    },
    {
      "name": "tita_flow::instructions::create_direct_flow::FlowCreatedEvent",
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
            "name": "flowType",
            "type": {
              "defined": {
                "name": "tita_flow::instructions::create_direct_flow::FlowType"
              }
            }
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
      "name": "tita_flow::instructions::create_direct_flow::FlowType",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "direct"
          },
          {
            "name": "milestone"
          },
          {
            "name": "weighted"
          }
        ]
      }
    },
    {
      "name": "tita_flow::instructions::create_milestone_flow::FlowCreatedEvent",
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
            "name": "flowType",
            "type": {
              "defined": {
                "name": "tita_flow::instructions::create_milestone_flow::FlowType"
              }
            }
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
      "name": "tita_flow::instructions::create_milestone_flow::FlowType",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "direct"
          },
          {
            "name": "milestone"
          },
          {
            "name": "weighted"
          }
        ]
      }
    },
    {
      "name": "tita_flow::instructions::create_weighted_flow::FlowCreatedEvent",
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
            "name": "flowType",
            "type": {
              "defined": {
                "name": "tita_flow::instructions::create_weighted_flow::FlowType"
              }
            }
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
      "name": "tita_flow::instructions::create_weighted_flow::FlowType",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "direct"
          },
          {
            "name": "milestone"
          },
          {
            "name": "weighted"
          }
        ]
      }
    }
  ]
};
