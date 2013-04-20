#!/bin/bash
# just call with ./kill_test_servers.sh buster-server|selenium|phantom

function get_buster_server_pid(){
    echo `ps aux|grep buster-server|grep node|awk '{ print $2 }'`
}

function get_selenium_server_pid(){
    echo `ps aux|grep selenium|grep java|awk '{ print $2 }'`
}

function get_phantom_server_pid(){
    echo `ps aux|grep phantomjs|grep buster|awk '{ print $2 }'`
}

case "$1" in
  "buster-server") server_pid=`get_buster_server_pid` ;;
  "selenium") server_pid=`get_selenium_server_pid` ;;
  "phantom") server_pid=`get_phantom_server_pid` ;;
esac


if [ "$server_pid" != "" ] ; then
    kill $server_pid
    echo "killed"
else
    echo "not killed"
    echo $server_pid
fi