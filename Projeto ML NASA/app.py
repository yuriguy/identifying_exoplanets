# app.py
import joblib
import json
import pandas as pd
from flask import Flask, request, jsonify

# 1. Inicializar a aplicação Flask
app = Flask(__name__)

# 2. Carregar o modelo e o encoder salvos
# Estes arquivos são carregados apenas uma vez, quando a API inicia.
try:
    model = joblib.load('exoplanet_classifier.joblib')
    encoder = joblib.load('label_encoder.joblib')
    print("Modelo e encoder carregados com sucesso.")
except FileNotFoundError:
    print("Arquivos de modelo não encontrados. Execute o script main.py primeiro.")
    model = None
    encoder = None

# Endpoint para obter as estatísticas do modelo
@app.route('/stats', methods=['GET'])
def get_stats():
    try:
        with open('model_stats.json', 'r') as f:
            stats = json.load(f)
        return jsonify(stats)
    except FileNotFoundError:
        return jsonify({"error": "Arquivo de estatísticas não encontrado. Execute o script main.py para gerá-lo."}), 404


# 3. Definir o endpoint de predição
@app.route('/predict', methods=['POST'])
def predict():
    if model is None or encoder is None:
        return jsonify({"error": "Modelo não está carregado."}), 500

    # 1. Verificar se um arquivo foi enviado na requisição
    if 'file' not in request.files:
        return jsonify({"error": "Nenhum arquivo enviado. Por favor, envie um arquivo CSV na chave 'file'."}), 400

    file = request.files['file']

    # 2. Validar se o nome do arquivo não está vazio e se é um CSV
    if file.filename == '':
        return jsonify({"error": "Nenhum arquivo selecionado."}), 400

    if not file.filename.endswith('.csv'):
        return jsonify({"error": "Formato de arquivo inválido. Por favor, envie um arquivo .csv"}), 400

    try:
        # 3. Ler o arquivo CSV para um DataFrame do Pandas
        data = pd.read_csv(file)

        # 4. Garantir que as colunas esperadas pelo modelo estão presentes e na ordem correta
        expected_cols = ["koi_fpflag_nt", "koi_fpflag_ss", "koi_fpflag_co", 
                         "koi_fpflag_ec", "koi_period", "koi_duration", "koi_depth", 
                         "koi_prad", "koi_teq", "koi_insol", "koi_model_snr", "koi_score"]
        data = data[expected_cols]

    except FileNotFoundError:
        return jsonify({"error": "Arquivo não encontrado."}), 400
    except Exception as e:
        return jsonify({"error": f"Erro ao processar o arquivo: {e}. Verifique se o formato e as colunas do CSV estão corretos."}), 400

    # 5. Processar o CSV e fazer predições
    results = []
    
    # Identificar linhas com valores ausentes
    invalid_rows = data.isnull().any(axis=1)
    valid_data = data.loc[~invalid_rows]

    # Fazer predições apenas para as linhas válidas (se houver alguma)
    if not valid_data.empty:
        predictions_encoded = model.predict(valid_data)
        predictions_labels = encoder.inverse_transform(predictions_encoded)
        # Adicionar as predições válidas à lista de resultados
        valid_indices = valid_data.index
        # Usamos to_dict('records') para obter uma lista de dicionários
        # e iteramos sobre ela para garantir a conversão de tipos.
        valid_data_list = valid_data.to_dict('records')
        for i, row_dict in enumerate(valid_data_list):
            index = valid_indices[i]
            row_data = {k: (float(v) if pd.notna(v) else None) for k, v in row_dict.items()}
            results.append({
                "index": int(index),
                "prediction": predictions_labels[i],
                "data": row_data
            })

    # Adicionar mensagens de erro para as linhas inválidas
    invalid_indices = data[invalid_rows].index
    for i in invalid_indices:
        row_data = {k: (float(v) if pd.notna(v) else None) for k, v in data.loc[i].to_dict().items()}
        results.append({
            "index": int(i),
            "prediction": "Error: Missing values in row.",
            "data": row_data
        })

    # Ordenar os resultados pelo índice original e retornar como JSON
    results.sort(key=lambda x: x['index'])
    return jsonify(results)


# Rodar a aplicação
if __name__ == '__main__':
    # O host='0.0.0.0' torna a API acessível na sua rede local
    app.run(host='0.0.0.0', port=5000, debug=True)
