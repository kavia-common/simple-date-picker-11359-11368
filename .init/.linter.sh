#!/bin/bash
cd /home/kavia/workspace/code-generation/simple-date-picker-11359-11368/date_picker_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

