#!/bin/bash
#TODO: add comments, remove tsc command from final version
port=3001


function checkConnection {
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
        return 1
    fi
    return 0
    
}

while true; do
  echo "Enter a command ( r=run in background, f=run in foreground, s=stop server, x=exit):"
  read input

  case $input in
    r)
      checkConnection
        if [ $? -eq 1 ]; then
            echo "Process already running on port $port.\n Press 1 if you want to kill the process and 0 to continue"
            read decision
            if [ $decision -eq 1 ]; then
                kill $(lsof -t -i :$port)
            else
                continue
            fi
        else
            echo "compiling..."
            npx webpack --config webpack.config.js
            echo "Running server in background..."
            node ./dist/server/server.js &
        fi
      
      ;;
    f)
 checkConnection
    if [ $? -eq 1 ]; then
        echo "Process already running on port $port.\n Press 1 if you want to kill the process and 0 to continue"
        read decision
        if [ $decision -eq 1 ]; then
            kill $(lsof -t -i :$port)
        else
            continue
        fi
    else
        echo "compiling..."
        npx webpack --config webpack.config.js
        echo "Running server in foreground..."
        node ./dist/server/server.js 
    fi
      
      ;;
    s)
      echo "Stopping server..."
      kill $(lsof -t -i :$port)
      ;;
    x)
      echo "Exiting..."
      break
      ;;
    *)
      echo "Invalid command."
      ;;
  esac
done

