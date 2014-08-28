/**
 * The queue of async task.
 * You can add task any time and then wait until last tasks is processed.
 * Each task should be function which has callback.
 * If any task returns error next tasks won't be processed
 * @constructor
 */
function AsyncQueue() {
    var _is_running = false;
    var _error = null;
    var _queue = [];
    var _last_callback = null;

    /**
     * Checks is there are more tasks in queue and if so than calls them
     */
    function nextTask() {
        if(!_is_running) {
            if(_queue.length == 0 || _error) {
                _queue = [];
                if(_last_callback) {
                    _last_callback(_error);
                    _last_callback = null;
                }
            } else {
                _is_running = true;

                var next = _queue.pop();
                next(function(err){
                    if(err) {
                        _queue = [];
                        _error = err;
                    }
                    _is_running = false;
                    nextTask();
                });
            }
        }
    }

    /**
     * Adds task
     * @param task_function must be function with one callback argument.
     */
    this.addTask = function(task_function) {
        if(!_error) {
            _queue.push(task_function);
            nextTask();
        }

    }

    /**
     * Waits until last async task is ended.
     * @param callback
     */
    this.waitUntilEnd = function(callback) {
        if(_is_running) {
            _last_callback = callback;
        } else {
            callback(_error);
        }
    }
}

module.exports = AsyncQueue;