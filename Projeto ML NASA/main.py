import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report
from sklearn.neighbors import KNeighborsClassifier
import joblib
from sklearn.ensemble import RandomForestClassifier, VotingClassifier
from sklearn.pipeline import Pipeline
from sklearn.metrics import accuracy_score
from sklearn.preprocessing import StandardScaler, LabelEncoder

# 1. Carregar dados
df = pd.read_csv("cumulative.csv")

print(df.head())
print(df.columns)

# 2. Selecionar parâmetros principais
# Vamos usar features mais informativas, incluindo os "flags" de falso positivo e o score do KOI
cols = ["koi_disposition", "koi_fpflag_nt", "koi_fpflag_ss", "koi_fpflag_co", 
        "koi_fpflag_ec", "koi_period", "koi_duration", "koi_depth", "koi_prad", 
        "koi_teq", "koi_insol", "koi_model_snr", "koi_score"]
df = df[cols]

# 3. Tratar valores ausentes (removendo linhas com valores nulos)
df = df.dropna()

# 4. Transformar a coluna alvo
y = df["koi_disposition"]
encoder = LabelEncoder()
y_encoded = encoder.fit_transform(y)   # CONFIRMED=1, CANDIDATE=0, FALSE POSITIVE=2
print("Classes mapeadas:", dict(zip(encoder.classes_, encoder.transform(encoder.classes_))))

# 5. Features (X) e Target (y)
X = df.drop(["koi_disposition"], axis=1)

# 6. Divisão treino/teste
# Usar y_encoded (1D) para o target e para a estratificação
X_train, X_test, y_train, y_test = train_test_split(
    X, y_encoded, test_size=0.2, random_state=42, stratify=y_encoded
)

# 7. Padronização dos dados
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# 8. Treinamento e Avaliação dos Modelos

print("\n--- KNeighbors Classifier ---")
knc = KNeighborsClassifier()
# Treinar com dados padronizados
knc.fit(X_train_scaled, y_train)
# Fazer predições com dados de teste padronizados
pred_knc = knc.predict(X_test_scaled)

acc_knc = accuracy_score(y_test, pred_knc)
print(f'Accuracy Score: {acc_knc * 100:.2f}%')
print("Classification Report:")
print(classification_report(y_test, pred_knc, target_names=encoder.classes_))
 
print("\n--- Logistic Regression (com balanceamento de classes) ---")
log_reg = LogisticRegression(max_iter=2000, random_state=42, class_weight='balanced')
# Treinar com dados padronizados
log_reg.fit(X_train_scaled, y_train)
# Fazer predições com dados de teste padronizados
pred_log_reg = log_reg.predict(X_test_scaled)

acc_reg = accuracy_score(y_test, pred_log_reg)
print(f'Accuracy Score: {acc_reg * 100:.2f}%')
print("Classification Report:")
print(classification_report(y_test, pred_log_reg, target_names=encoder.classes_))

print("\n--- Random Forest Classifier ---")
rf = RandomForestClassifier(n_estimators=100, random_state=42, class_weight='balanced')
# Modelos de árvore não necessitam de dados padronizados, mas não há problema em usá-los.
# Vamos treinar com os dados não padronizados para variar.
rf.fit(X_train, y_train)
# Fazer predições
pred_rf = rf.predict(X_test)

acc_rf = accuracy_score(y_test, pred_rf)
print(f'Accuracy Score: {acc_rf * 100:.2f}%')
print("Classification Report:")
print(classification_report(y_test, pred_rf, target_names=encoder.classes_))

print("\n--- Ensemble (Voting Classifier) ---")
# Para o VotingClassifier, é uma boa prática usar Pipelines para os modelos que precisam de scaling

# 1. Criar os classificadores base
clf1 = LogisticRegression(max_iter=2000, random_state=42, class_weight='balanced')
clf2 = RandomForestClassifier(n_estimators=100, random_state=42, class_weight='balanced')
clf3 = KNeighborsClassifier()

# 2. Criar pipelines para os modelos que precisam de dados padronizados
pipe1 = Pipeline([('scaler', StandardScaler()), ('lr', clf1)])
pipe3 = Pipeline([('scaler', StandardScaler()), ('knn', clf3)])

# 3. Criar e treinar o Voting Classifier
eclf1 = VotingClassifier(estimators=[('lr', pipe1), ('rf', clf2), ('knn', pipe3)], voting='hard')
eclf1 = eclf1.fit(X_train, y_train)
pred_ensemble = eclf1.predict(X_test)

acc_ensemble = accuracy_score(y_test, pred_ensemble)
print(f'Accuracy Score: {acc_ensemble * 100:.2f}%')
print("Classification Report:")
print(classification_report(y_test, pred_ensemble, target_names=encoder.classes_))

# 4. Gerar e salvar as estatísticas do modelo final
print("\nGerando estatísticas do modelo para a API...")
model_stats = {
    'accuracy': acc_ensemble,
    'classification_report': classification_report(y_test, pred_ensemble, target_names=encoder.classes_, output_dict=True)
}

import json
with open('model_stats.json', 'w') as f:
    json.dump(model_stats, f, indent=4)

# 5. Salvar o modelo e o encoder para o deploy
print("Salvando o modelo de ensemble, o encoder e as estatísticas...")
joblib.dump(eclf1, 'exoplanet_classifier.joblib')
joblib.dump(encoder, 'label_encoder.joblib')
print("Modelo, encoder e estatísticas salvos com sucesso!")