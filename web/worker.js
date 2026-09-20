self.onmessage = function (event) {
  try {
    const {current,baseline,options} = event.data;
    const report=FailFold.analyze(current,baseline,options);
    self.postMessage({report,markdown:FailFold.markdown(report)});
  } catch (error) { self.postMessage({error:String(error.message)}); }
};
