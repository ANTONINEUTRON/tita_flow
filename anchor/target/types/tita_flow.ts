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
      "name": "close",
      "discriminator": [
        98,
        165,
        201,
        177,
        108,
        65,
        206,
        96
      ],
      "accounts": [],
      "args": []
    },
    {
      "name": "contributeDirect",
      "discriminator": [
        123,
        85,
        52,
        210,
        34,
        70,
        211,
        182
      ],
      "accounts": [
        {
          "name": "contributor",
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
                "kind": "account",
                "path": "flow.flow_id",
                "account": "flow"
              },
              {
                "kind": "account",
                "path": "flow.creator",
                "account": "flow"
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
          "name": "contribution",
          "writable": true
        },
        {
          "name": "userTokenAccount",
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
      "name": "contributeMilestones",
      "discriminator": [
        145,
        43,
        130,
        207,
        19,
        132,
        220,
        200
      ],
      "accounts": [],
      "args": []
    },
    {
      "name": "contributeWeighted",
      "discriminator": [
        160,
        238,
        167,
        151,
        73,
        165,
        118,
        178
      ],
      "accounts": [],
      "args": []
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
          "name": "flowType",
          "type": {
            "defined": {
              "name": "flowType"
            }
          }
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
          "name": "rules",
          "type": {
            "vec": {
              "defined": {
                "name": "ruleType"
              }
            }
          }
        },
        {
          "name": "votingMechanisms",
          "type": {
            "vec": {
              "defined": {
                "name": "votingMechanism"
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
      "accounts": [],
      "args": []
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
      "accounts": [],
      "args": []
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
    }
  ],
  "events": [
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
      "name": "emptyFlowId",
      "msg": "Flow ID cannot be empty"
    },
    {
      "code": 6001,
      "name": "invalidGoalAmount",
      "msg": "Invalid goal amount"
    },
    {
      "code": 6002,
      "name": "invalidStartTime",
      "msg": "Invalid start time"
    },
    {
      "code": 6003,
      "name": "invalidEndTime",
      "msg": "Invalid end time"
    },
    {
      "code": 6004,
      "name": "invalidTimeframe",
      "msg": "Invalid timeframe"
    },
    {
      "code": 6005,
      "name": "noRulesSpecified",
      "msg": "No rules specified"
    },
    {
      "code": 6006,
      "name": "incompatibleRules",
      "msg": "Incompatible rules combination"
    },
    {
      "code": 6007,
      "name": "flowEnded",
      "msg": "Flow has ended"
    },
    {
      "code": 6008,
      "name": "inactiveFlow",
      "msg": "Flow is inactive"
    },
    {
      "code": 6009,
      "name": "invalidOwner",
      "msg": "Invalid Owner"
    },
    {
      "code": 6010,
      "name": "invalidMint",
      "msg": "Invalid Mint"
    },
    {
      "code": 6011,
      "name": "emptyDistribution",
      "msg": "Empty distribution"
    },
    {
      "code": 6012,
      "name": "invalidAmount",
      "msg": "Invalid amount"
    },
    {
      "code": 6013,
      "name": "mathOverflow",
      "msg": "Math overflow"
    },
    {
      "code": 6014,
      "name": "distributionExceedsContribution",
      "msg": "Distribution exceeds contribution amount"
    },
    {
      "code": 6015,
      "name": "ruleNotSupported",
      "msg": "Rule not supported"
    },
    {
      "code": 6016,
      "name": "insufficientFunds",
      "msg": "Insufficient funds"
    },
    {
      "code": 6017,
      "name": "tokenTransferFailed",
      "msg": "Token transfer failed"
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
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "timestamp",
            "type": "i64"
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
            "name": "contributorCount",
            "type": "u32"
          },
          {
            "name": "milestoneCount",
            "type": "u32"
          },
          {
            "name": "proposalCount",
            "type": "u32"
          },
          {
            "name": "flowType",
            "type": {
              "defined": {
                "name": "flowType"
              }
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
            "name": "tokenMint",
            "type": "pubkey"
          },
          {
            "name": "rules",
            "type": {
              "vec": {
                "defined": {
                  "name": "ruleType"
                }
              }
            }
          },
          {
            "name": "votingMechanisms",
            "type": {
              "vec": {
                "defined": {
                  "name": "votingMechanism"
                }
              }
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
            "name": "flowType",
            "type": {
              "defined": {
                "name": "flowType"
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
      "name": "flowType",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "raise"
          },
          {
            "name": "distribute"
          }
        ]
      }
    },
    {
      "name": "ruleType",
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
      "name": "votingMechanism",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "standard"
          },
          {
            "name": "futarchy"
          },
          {
            "name": "quadratic"
          }
        ]
      }
    }
  ]
};
