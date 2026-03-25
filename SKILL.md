---
name: vecml-automl
description: >
  VecML AutoML — Upload datasets, train ML models, and run predictions through the VecML API.
  Use this skill when the user asks to: train a model, upload data for ML, run predictions,
  classify data, do regression, check model status, get feature importance, build a pipeline,
  or anything involving machine learning, AutoML, or the VecML platform.
  Also triggers on: "predict", "train", "classify", "ML", "machine learning", "model",
  "feature importance", "upload dataset", "data pipeline".
metadata:
  clawdbot:
    emoji: "🧠"
    requires:
      commands: ["curl"]
      env: ["VECML_API_KEY"]
    homepage: "https://aidb.vecml.com/docs/site/automl_api/"
---

# VecML AutoML Skill

Full ML pipeline through the VecML AutoML API — upload data, train models, predict, and analyze.

## Setup

Set your API key (stored in OpenClaw secrets):
```bash
openclaw secrets set VECML_API_KEY "vml_your_key_here"
```

API base: `https://aidb.vecml.com/api`

All requests are JSON POST. All file data must be base64-encoded.

---

## Quick Reference

| Action | Endpoint |
|--------|----------|
| Create project | `/create_project` |
| Upload features | `/upload_automl_X` |
| Attach labels | `/attach_automl_label` |
| Train model | `/train_automl_model` |
| Training status | `/get_automl_training_status` |
| Predict | `/automl_predict` |
| Feature importance | `/get_feature_importance` |
| Validation metrics | `/get_model_validation_metric` |
| List models | `/list_automl_model_infos` |
| Delete model | `/delete_automl_model` |

---

## Step 1: Create Project

```bash
curl -s -X POST https://aidb.vecml.com/api/create_project \
  -H "Content-Type: application/json" \
  -d '{"user_api_key":"'"$VECML_API_KEY"'","project_name":"my_project","application":"autoML"}'
```

## Step 2: Upload Features (base64 CSV)

```bash
X_B64=$(base64 -i train_features.csv)
curl -s -X POST https://aidb.vecml.com/api/upload_automl_X \
  -H "Content-Type: application/json" \
  -d '{"user_api_key":"'"$VECML_API_KEY"'","project_name":"my_project","collection_name":"my_dataset","X":"'"$X_B64"'","file_format":"csv","has_field_names":true,"vector_type":"dense","categorical_features":["col1","col2"]}'
```

## Step 3: Attach Labels

**IMPORTANT**: Use `file_data` and `attribute_name` (NOT `label` or `label_attribute`).

```bash
Y_B64=$(base64 -i train_labels.csv)
curl -s -X POST https://aidb.vecml.com/api/attach_automl_label \
  -H "Content-Type: application/json" \
  -d '{"user_api_key":"'"$VECML_API_KEY"'","project_name":"my_project","collection_name":"my_dataset","file_data":"'"$Y_B64"'","file_format":"csv","has_field_names":true,"attribute_name":"target"}'
```

**Wait for this job to complete before training!** Check with:
```bash
curl -s -X POST https://aidb.vecml.com/api/get_automl_training_status \
  -H "Content-Type: application/json" \
  -d '{"user_api_key":"'"$VECML_API_KEY"'","job_id":"<job_id_from_label_upload>"}'
```

## Step 4: Train Model

```bash
curl -s -X POST https://aidb.vecml.com/api/train_automl_model \
  -H "Content-Type: application/json" \
  -d '{"user_api_key":"'"$VECML_API_KEY"'","project_name":"my_project","collection_name":"my_dataset","model_name":"model_v1","training_mode":"balanced","task_type":"classification","label_attribute":"target","train_categorical_features":["col1","col2"]}'
```

Training modes: `high_speed` | `balanced` | `high_accuracy`
Task types: `classification` | `regression`

## Step 5: Poll Training Status

```bash
curl -s -X POST https://aidb.vecml.com/api/get_automl_training_status \
  -H "Content-Type: application/json" \
  -d '{"user_api_key":"'"$VECML_API_KEY"'","job_id":"<job_id_from_train>"}'
```

Wait until `"status": "finished"`.

## Step 6: Get Metrics

```bash
curl -s -X POST https://aidb.vecml.com/api/get_model_validation_metric \
  -H "Content-Type: application/json" \
  -d '{"user_api_key":"'"$VECML_API_KEY"'","project_name":"my_project","collection_name":"my_dataset","model_name":"model_v1"}'
```

## Step 7: Feature Importance

```bash
curl -s -X POST https://aidb.vecml.com/api/get_feature_importance \
  -H "Content-Type: application/json" \
  -d '{"user_api_key":"'"$VECML_API_KEY"'","project_name":"my_project","collection_name":"my_dataset","model_name":"model_v1"}'
```

## Step 8: Predict

With inline file:
```bash
TEST_B64=$(base64 -i test.csv)
curl -s -X POST https://aidb.vecml.com/api/automl_predict \
  -H "Content-Type: application/json" \
  -d '{"user_api_key":"'"$VECML_API_KEY"'","project_name":"my_project","collection_name":"my_dataset","model_name":"model_v1","file_data":"'"$TEST_B64"'","file_format":"csv","has_field_names":true}'
```

With uploaded collection:
```bash
curl -s -X POST https://aidb.vecml.com/api/automl_predict \
  -H "Content-Type: application/json" \
  -d '{"user_api_key":"'"$VECML_API_KEY"'","project_name":"my_project","collection_name":"my_dataset","model_name":"model_v1","prediction_dataset":"test_collection"}'
```

## Step 9: List Models

```bash
curl -s -X POST https://aidb.vecml.com/api/list_automl_model_infos \
  -H "Content-Type: application/json" \
  -d '{"user_api_key":"'"$VECML_API_KEY"'","project_name":"my_project","collection_name":"my_dataset"}'
```

## Step 10: Delete Model

```bash
curl -s -X POST https://aidb.vecml.com/api/delete_automl_model \
  -H "Content-Type: application/json" \
  -d '{"user_api_key":"'"$VECML_API_KEY"'","project_name":"my_project","collection_name":"my_dataset","model_name":"model_v1"}'
```

---

## Common Pitfalls

1. **"Project does not exist"** → Call `/create_project` first with `"application": "autoML"`
2. **Wrong field names for labels** → Use `file_data` + `attribute_name` (NOT `label` + `label_attribute`)
3. **Server exception on predict** → Labels weren't attached before training started. Wait for label job to finish.
4. **Dimension mismatch** → Test data must have same columns in same order as training data
5. **All file data must be base64-encoded** — never raw CSV in JSON body

---

## Example: One-Shot Pipeline (Python)

```python
import requests, base64, time

API = "https://aidb.vecml.com/api"
KEY = "your_key"

def post(ep, data): return requests.post(f"{API}/{ep}", json=data).json()
def b64(path):
    with open(path,"rb") as f: return base64.b64encode(f.read()).decode()

# 1. Create project
post("create_project", {"user_api_key":KEY, "project_name":"demo", "application":"autoML"})

# 2. Upload features
r = post("upload_automl_X", {"user_api_key":KEY, "project_name":"demo",
    "collection_name":"data", "X":b64("features.csv"), "file_format":"csv",
    "has_field_names":True, "vector_type":"dense", "categorical_features":["cat1"]})

# 3. Attach labels (WAIT for completion)
r = post("attach_automl_label", {"user_api_key":KEY, "project_name":"demo",
    "collection_name":"data", "file_data":b64("labels.csv"), "file_format":"csv",
    "has_field_names":True, "attribute_name":"target"})
job = r["job_id"]
while True:
    s = post("get_automl_training_status", {"user_api_key":KEY, "job_id":job})
    if s.get("status") == "finished": break
    time.sleep(2)

# 4. Train
r = post("train_automl_model", {"user_api_key":KEY, "project_name":"demo",
    "collection_name":"data", "model_name":"v1", "training_mode":"balanced",
    "task_type":"classification", "label_attribute":"target"})
job = r["job_id"]
while True:
    s = post("get_automl_training_status", {"user_api_key":KEY, "job_id":job})
    if s.get("status") == "finished": break
    time.sleep(5)

# 5. Predict
r = post("automl_predict", {"user_api_key":KEY, "project_name":"demo",
    "collection_name":"data", "model_name":"v1",
    "file_data":b64("test.csv"), "file_format":"csv", "has_field_names":True})
print(r)
```
