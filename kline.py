# coding:utf-8
import requests
import json

def init(ContextInfo):
    print("=== INITIALIZING QMT RUN TIME TIMER ===")
    
    # Fix the AttributeError: use run_time instead of register_timer
    # "60nSecond" means triggering every 60 seconds
    # "call_back" is the name of the function to execute
    ContextInfo.run_time("call_back", "60nSecond", "2026-09-17 00:00:00")

def handlebar(ContextInfo):
    pass

def call_back(ContextInfo):
    import datetime
    now = datetime.datetime.now().time()
    
    # Only execute during A-share market trading sessions
    start_time = datetime.time(9, 15, 0)
    end_time = datetime.time(15, 5, 0)
    
    if not (start_time <= now <= end_time):
        return
        
    run_realtime_task(ContextInfo)

def run_realtime_task(ContextInfo):
    print("=== TRIGGERING REALTIME INCREMENTAL PUSH ===")
    
    # --- PHASE 1: DATA EXTRACTION WITH ERROR HANDLING ---
    try:
        stock_list = ContextInfo.get_stock_list_in_sector("沪深A股")
        print(stock_list)
        if not stock_list:
            print("Warning: Sector list is empty.")
            return
        market_data = {}
        for i in range(0, len(stock_list), 50):
            batch = stock_list[i:i+50]
            batch_data = ContextInfo.get_market_data_ex([], batch, "1m", "", "", 1, subscribe=True)
            if batch_data:
                market_data.update(batch_data)
            print(i)
            print(f"Fetched batch {i//50 + 1}: {len(batch)} stocks")
        # print(ContextInfo.get_full_tick(stock_code=["000001.SZ", "600519.SH", "000002.SZ", "600000.SH"]))
        # print(ContextInfo.get_total_share('600000.SH'))
    except Exception as data_err:
        print(f"Error fetching data from QMT core: {data_err}")
        return # Exit this minute's run safely
        
    # --- PHASE 2: DATA PROCESSING ---
    incremental_records = []    
    try:
        for stock_code, df in market_data.items():
            if df.empty:
                continue
            last_row = df.iloc[-1]
            timestamp = int(last_row['time'])
            
            record = {
                "symbol": stock_code,
                "timestamp": timestamp,
                "open": float(last_row['open']),
                "high": float(last_row['high']),
                "low": float(last_row['low']),
                "close": float(last_row['close']),
                "volume": float(last_row['volume']),
                "amount": float(last_row['amount'])
            }
            incremental_records.append(record)
    except Exception as proc_err:
        print(f"Error packing data frame: {proc_err}")
        return
        
    print(f"Total incremental rows prepared: {len(incremental_records)}")

    # --- PHASE 3: HTTP PUSH WITH NETWORK TIMEOUT PROTECTION ---
    if incremental_records:
        target_url = "http://127.0.0.1:3002/kline"
        headers = {"Content-Type": "application/json"}
        payload = {"data": incremental_records}
        
        try:
            # timeout=3 is vital. It stops network lag from freezing QMT UI.
            # trust_env=False: 绕过系统代理，127.0.0.1 直连后端（否则代理返回 502）
            session = requests.Session()
            session.trust_env = False
            # timeout=3 is vital. It stops network lag from freezing QMT UI.
            response = requests.post(target_url, data=json.dumps(payload), headers=headers, timeout=3)
            if response.status_code == 200:
                return
                #print("HTTP Push Success!")
            else:
                print(f"HTTP Warning: Server responded status {response.status_code}")
        except requests.exceptions.RequestException as net_err:
            # Captures timeouts, DNS errors, connection drops without crashing
            print(f"Network error occurred (Server might be down): {net_err}")