#!/bin/bash
# /etc/init.d/iguess
# Based on code presented here:
# http://forums.bukkit.org/threads/tutorial-centos-bukkit-installation.56371/
 
#Settings
SERVICE="IGUESS_TEST"
RAILS_ENV=development

USERNAME="iguess"
HOMEPATH='/home/iguess/iguess_test/iguess'
PORT=2000

INVOCATION="rails s -p$PORT -d"
PIDFILE="$HOMEPATH/tmp/pids/server.pid"
 
ME=`whoami`

as_user() {
  if [ $ME == $USERNAME ] ; then
    bash -c "$1"
    echo bash -c \"$1\"
  else
    su - $USERNAME -c "$1"
  fi
}
 
iguess_start() {
  if [ -f $PIDFILE ] && ps aux |grep `cat $PIDFILE` | grep rails > /dev/null
  then
    echo "Tried to start but $SERVICE was already running!"
  else
    echo "$SERVICE was not running... starting."
    as_user "cd $HOMEPATH && export RAILS_ENV=$RAILS_ENV && $INVOCATION"
    sleep 3
    if [ -f $PIDFILE ] && ps aux |grep `cat $PIDFILE` | grep rails > /dev/null
    then
      echo "$SERVICE is now running."
    else
      echo "Could not start $SERVICE."
    fi
  fi
}
 
 
iguess_stop() {
  if [ -f $PIDFILE ] && ps aux |grep `cat $PIDFILE` | grep rails > /dev/null
  then
    echo "$SERVICE is running... stopping."
    as_user "kill -INT `cat $PIDFILE` > /dev/null"
    sleep 3
  else
    echo "$SERVICE was not running."
  fi
  if [ -f $PIDFILE ] && ps aux |grep `cat $PIDFILE` | grep rails > /dev/null
  then
    echo "$SERVICE could not be shut down... still running."
  else
    echo "$SERVICE is shut down."
  fi
}
 
 
iguess_update() {
  if [ -f $PIDFILE ] && ps aux |grep `cat $PIDFILE` | grep rails > /dev/null
  then
    echo "$SERVICE is running! Will not start update."
  else
    git pull
  fi
}

 
 
#Start-Stop here
case "$1" in
  start)
    iguess_start
    ;;
  stop)
    iguess_stop
    ;;
  restart)
    iguess_stop
    iguess_start
    ;;
  update)
    iguess_stop
    iguess_update
    iguess_start
    ;;
  status)
    if [ -f $PIDFILE ] && ps aux |grep `cat $PIDFILE` | grep rails > /dev/null
    then
      echo "$SERVICE is running."
    else
      echo "$SERVICE is not running."
    fi
    ;;
 
  *)
  echo "Usage: service iguess {start|stop|update|status|restart}"
  exit 1
  ;;
esac
 
exit 0